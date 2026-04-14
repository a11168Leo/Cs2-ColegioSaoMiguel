/* ===================== AUTH.JS =====================
   Gere login, logout e estado da sessão.
   O registo público foi desativado — contas são criadas
   externamente via manage-accounts.html (admin only).
   Funciona com duas páginas separadas:
     - login.html  → formulário de login (apenas)
     - index.html  → painel principal (protegido)
   Dados guardados em localStorage (demo sem backend).
   ===================================================== */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     Utilitários de UI
  ───────────────────────────────────────── */
  function setError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
  }

  function getEl(id) {
    return document.getElementById(id);
  }

  /* ─────────────────────────────────────────
     Overlay de transição
  ───────────────────────────────────────── */
  function showTransition(text) {
    const overlay = getEl('page-transition');
    const label   = getEl('transition-text');
    if (!overlay) return;
    if (label) label.textContent = text || 'A carregar...';
    overlay.classList.remove('active');
    void overlay.offsetWidth;
    overlay.classList.add('active');
  }

  function hideTransition() {
    const overlay = getEl('page-transition');
    if (!overlay) return;
    overlay.classList.remove('active');
  }

  /* ─────────────────────────────────────────
     Toggle visibilidade da password
  ───────────────────────────────────────── */
  window.togglePass = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.classList.toggle('active', !isText);
  };

  /* ─────────────────────────────────────────
     Preencher UI do index com dados do user
  ───────────────────────────────────────── */
  function populateAppUI(session) {
    const initials = (session.username || 'U').slice(0, 2).toUpperCase();

    const heroUsername    = getEl('hero-username');
    const sidebarUsername = getEl('sidebar-username');
    const sidebarRole     = getEl('sidebar-role');
    const topbarAvatar    = getEl('topbar-avatar');
    const sidebarAvatar   = getEl('sidebar-avatar');
    const appShell        = getEl('app-shell');

    if (heroUsername)    heroUsername.textContent    = session.username;
    if (sidebarUsername) sidebarUsername.textContent = session.username;
    if (sidebarRole)     sidebarRole.textContent     = session.role || 'Utilizador';
    if (topbarAvatar)    topbarAvatar.textContent    = initials;
    if (sidebarAvatar)   sidebarAvatar.src =
      `https://placehold.co/32x32/1e3a5f/60a5fa?text=${initials}`;

    if (appShell) appShell.style.display = '';
  }

  /* ─────────────────────────────────────────
     LOGIN
  ───────────────────────────────────────── */
  window.doLogin = function () {
    const usernameEl = getEl('login-user');
    const passwordEl = getEl('login-pass');
    const rememberEl = getEl('remember-me');

    if (!usernameEl || !passwordEl) return;

    const username = usernameEl.value.trim();
    const password = passwordEl.value;

    if (!username || !password) {
      setError('login-error', 'Preenche todos os campos.');
      return;
    }

    /* verifica conta guardada em localStorage */
    const stored  = JSON.parse(localStorage.getItem('cs2csm_users') || '{}');
    const account = stored[username.toLowerCase()];

    if (!account || account.password !== btoa(password)) {
      setError('login-error', 'Utilizador ou password incorretos.');
      return;
    }

    setError('login-error', '');

    /* guarda sessão */
    const session = { username: account.username, role: account.role };
    if (rememberEl && rememberEl.checked) {
      localStorage.setItem('cs2csm_session', JSON.stringify(session));
    } else {
      sessionStorage.setItem('cs2csm_session', JSON.stringify(session));
    }

    showTransition('A carregar painel...');
    setTimeout(function () {
      window.location.href = 'index.html';
    }, 1000);
  };

  /* ─────────────────────────────────────────
     LOGOUT
  ───────────────────────────────────────── */
  window.doLogout = function () {
    showTransition('A terminar sessão...');
    setTimeout(function () {
      localStorage.removeItem('cs2csm_session');
      sessionStorage.removeItem('cs2csm_session');
      window.location.href = 'login.html';
    }, 1000);
  };

  /* ─────────────────────────────────────────
     VERIFICAR SESSÃO
     - login.html : se já tem sessão → vai para index
     - index.html : se NÃO tem sessão → vai para login
  ───────────────────────────────────────── */
  function checkSession() {
    const raw =
      localStorage.getItem('cs2csm_session') ||
      sessionStorage.getItem('cs2csm_session');

    const isLoginPage = window.location.pathname.endsWith('login.html') ||
                        window.location.pathname === '/' ||
                        window.location.pathname === '';
    const isIndexPage = window.location.pathname.endsWith('index.html') ||
                        window.location.pathname.endsWith('/');

    if (raw) {
      try {
        const session = JSON.parse(raw);
        if (session && session.username) {
          if (isLoginPage) {
            window.location.href = 'index.html';
            return;
          }
          populateAppUI(session);
          return;
        }
      } catch (_) {}
    }

    if (!isLoginPage) {
      window.location.href = 'login.html';
    }
  }

  /* ─────────────────────────────────────────
     Listeners de teclado (Enter)
  ───────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    const formLogin = getEl('form-login');
    if (formLogin && !formLogin.classList.contains('hidden')) window.doLogin();
  });

  /* ─────────────────────────────────────────
     Init no DOMContentLoaded
  ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    checkSession();

    ['status', 'command-status'].forEach(function (id) {
      const el = getEl(id);
      if (!el) return;
      new MutationObserver(function () {
        el.style.display = el.textContent.trim() ? 'block' : 'none';
      }).observe(el, { childList: true, subtree: true, characterData: true });
    });

    const serverForm = getEl('server-form');
    if (serverForm) {
      serverForm.addEventListener('submit', function () {
        setTimeout(function () {
          const ip      = getEl('ip');
          const players = getEl('players');
          const map     = getEl('map');
          const topbarIp     = getEl('topbar-ip');
          const cardPlayers  = getEl('card-players');
          const cardMap      = getEl('card-map');

          if (ip && topbarIp)         topbarIp.textContent    = ip.value;
          if (players && cardPlayers) cardPlayers.textContent = players.value + ' / ' + players.value;
          if (map && cardMap)         cardMap.textContent     = map.value;
        }, 60);
      });
    }

    document.querySelectorAll('.sidebar-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.sidebar-item').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        const breadcrumb = document.querySelector('.page-breadcrumb');
        if (breadcrumb) breadcrumb.textContent = btn.textContent.trim();
      });
    });
  });

})();