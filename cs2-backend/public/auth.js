/* ===================== AUTH.JS =====================
   Gere login, logout e estado da sessão.
   Comunicação via API REST — sem localStorage para users.
   Token de sessão guardado em localStorage/sessionStorage.
   ===================================================== */

(function () {
  'use strict';

  // ── URL base da API (ajusta se necessário) ────────────────
  var API_BASE = '';  // vazio = mesmo servidor; ex: 'http://localhost:3000'
  var TOKEN_KEY = 'cs2csm_token';

  /* ─────────────────────────────────────────
     Utilitários de UI
  ───────────────────────────────────────── */
  function setError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }

  function getEl(id) { return document.getElementById(id); }

  /* ─────────────────────────────────────────
     API helper
  ───────────────────────────────────────── */
  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }

  function saveToken(token, persistent) {
    if (persistent) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }

  async function apiFetch(path, options) {
    options = options || {};
    options.headers = options.headers || {};
    var token = getToken();
    if (token) options.headers['Authorization'] = 'Bearer ' + token;
    options.headers['Content-Type'] = 'application/json';
    var res = await fetch(API_BASE + path, options);
    if (res.status === 204) return {};
    return res.json();
  }

  // Exporta para uso no index.html e manage-accounts.html
  window.CS2API = {
    fetch: apiFetch,
    getToken: getToken
  };

  /* ─────────────────────────────────────────
     Overlay de transição
  ───────────────────────────────────────── */
  function showTransition(text) {
    var overlay = getEl('page-transition');
    var label   = getEl('transition-text');
    if (!overlay) return;
    if (label) label.textContent = text || 'A carregar...';
    overlay.classList.remove('active');
    void overlay.offsetWidth;
    overlay.classList.add('active');
  }

  /* ─────────────────────────────────────────
     Toggle visibilidade da password
  ───────────────────────────────────────── */
  window.togglePass = function (inputId, btn) {
    var input = document.getElementById(inputId);
    if (!input) return;
    var isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.classList.toggle('active', !isText);
  };

  /* ─────────────────────────────────────────
     Preencher UI do index com dados do user
  ───────────────────────────────────────── */
  function populateAppUI(user) {
    var initials = (user.username || 'U').slice(0, 2).toUpperCase();

    var heroUsername    = getEl('hero-username');
    var sidebarUsername = getEl('sidebar-username');
    var sidebarRole     = getEl('sidebar-role');
    var topbarAvatar    = getEl('topbar-avatar');
    var sidebarAvatar   = getEl('sidebar-avatar');
    var appShell        = getEl('app-shell');

    if (heroUsername)    heroUsername.textContent    = user.username;
    if (sidebarUsername) sidebarUsername.textContent = user.username;
    if (sidebarRole)     sidebarRole.textContent     = user.role || 'Utilizador';
    if (topbarAvatar)    topbarAvatar.textContent    = initials;
    if (sidebarAvatar)   sidebarAvatar.src =
      'https://placehold.co/32x32/1e3a5f/60a5fa?text=' + initials;

    if (appShell) appShell.style.display = '';

    // Role-based access control
    var role = user.role || '';
    document.querySelectorAll('.role-manager-only').forEach(function (el) {
      el.classList.toggle('hidden', role !== 'Manager');
    });
    if (role !== 'Manager') {
      var gpView = document.getElementById('view-gerir-pessoas');
      if (gpView) gpView.classList.add('hidden');
    }

    // Guardar user na sessão para acesso local
    window._cs2Session = user;
  }

  /* ─────────────────────────────────────────
     LOGIN
  ───────────────────────────────────────── */
  window.doLogin = async function () {
    var usernameEl = getEl('login-user');
    var passwordEl = getEl('login-pass');
    var rememberEl = getEl('remember-me');

    if (!usernameEl || !passwordEl) return;

    var username = usernameEl.value.trim();
    var password = passwordEl.value;

    if (!username || !password) {
      setError('login-error', 'Preenche todos os campos.');
      return;
    }

    try {
      var data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username, password: password, remember: rememberEl && rememberEl.checked })
      });

      if (data.error) {
        setError('login-error', data.error);
        return;
      }

      saveToken(data.token, rememberEl && rememberEl.checked);
      setError('login-error', '');
      showTransition('A carregar painel...');
      setTimeout(function () { window.location.href = 'index.html'; }, 900);

    } catch (err) {
      setError('login-error', 'Erro de ligação ao servidor.');
    }
  };

  /* ─────────────────────────────────────────
     LOGOUT
  ───────────────────────────────────────── */
  window.doLogout = async function () {
    showTransition('A terminar sessão...');
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    clearToken();
    setTimeout(function () { window.location.href = 'login.html'; }, 800);
  };

  /* ─────────────────────────────────────────
     VERIFICAR SESSÃO
  ───────────────────────────────────────── */
  async function checkSession() {
    var path = window.location.pathname;
    var isLoginPage = path.endsWith('login.html') || path === '/' || path === '';

    var token = getToken();

    if (!token) {
      if (!isLoginPage) window.location.href = 'login.html';
      return;
    }

    try {
      var data = await apiFetch('/api/auth/me');

      if (data.error) {
        clearToken();
        if (!isLoginPage) window.location.href = 'login.html';
        return;
      }

      if (isLoginPage) {
        window.location.href = 'index.html';
        return;
      }

      populateAppUI(data.user);

    } catch (err) {
      // Servidor inacessível — modo offline (graceful degradation)
      console.warn('API inacessível, a tentar modo offline...');
      if (!isLoginPage) {
        // Permite abrir o painel mas sem dados reais
        var appShell = getEl('app-shell');
        if (appShell) appShell.style.display = '';
      }
    }
  }

  /* ─────────────────────────────────────────
     Listeners de teclado (Enter)
  ───────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var formLogin = getEl('form-login');
    if (formLogin && !formLogin.classList.contains('hidden')) window.doLogin();
  });

  /* ─────────────────────────────────────────
     Init no DOMContentLoaded
  ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    checkSession();

    ['status', 'command-status'].forEach(function (id) {
      var el = getEl(id);
      if (!el) return;
      new MutationObserver(function () {
        el.style.display = el.textContent.trim() ? 'block' : 'none';
      }).observe(el, { childList: true, subtree: true, characterData: true });
    });

    var serverForm = getEl('server-form');
    if (serverForm) {
      serverForm.addEventListener('submit', function () {
        setTimeout(function () {
          var ip      = getEl('ip');
          var players = getEl('players');
          var map     = getEl('map');
          var topbarIp     = getEl('topbar-ip');
          var cardPlayers  = getEl('card-players');
          var cardMap      = getEl('card-map');
          if (ip && topbarIp)         topbarIp.textContent    = ip.value;
          if (players && cardPlayers) cardPlayers.textContent = players.value + ' / ' + players.value;
          if (map && cardMap)         cardMap.textContent     = map.value;
        }, 60);
      });
    }
  });

})();
