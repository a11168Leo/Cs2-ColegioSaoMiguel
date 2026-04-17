/* ===================== APP.JS =====================
   Lógica do painel principal (index.html).
   Gere o formulário de servidor e os comandos rápidos.
   O auth (login, logout, sessão) fica todo em auth.js.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ─────────────────────────────────────────
     Elementos do DOM
  ───────────────────────────────────────── */
  const form          = document.getElementById('server-form');
  const statusBox     = document.getElementById('status');
  const commandStatus = document.getElementById('command-status');
  const summaryMap    = document.getElementById('summary-map');
  const summaryPlayers= document.getElementById('summary-players');
  const summaryIp     = document.getElementById('summary-ip');
  const mapInput      = document.getElementById('map');

  /* ─────────────────────────────────────────
     Funções de API
  ───────────────────────────────────────── */
  async function postConfig(config) {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return response.json();
  }

  async function sendCommand(action) {
    const response = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    return response.json();
  }

  /* ─────────────────────────────────────────
     Formulário de configuração
  ───────────────────────────────────────── */
  if (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const config = {
        map:          mapInput ? mapInput.value.trim() : '',
        totalPlayers: Number(document.getElementById('players').value),
        ipAddress:    document.getElementById('ip').value.trim()
      };

      try {
        const result = await postConfig(config);
        if (statusBox) {
          statusBox.textContent = result.message || 'Configuração salva com sucesso.';
          statusBox.className   = 'status success';
        }
        if (summaryPlayers) summaryPlayers.textContent = config.totalPlayers;
        if (summaryIp)      summaryIp.textContent      = config.ipAddress || 'não configurado';
        if (summaryMap)     summaryMap.textContent      = config.map;
      } catch (_) {
        if (statusBox) {
          statusBox.textContent = 'Erro ao salvar configuração.';
          statusBox.className   = 'status error';
        }
      }
    });
  }

  /* ─────────────────────────────────────────
     Seleção de mapa
  ───────────────────────────────────────── */
  const mapCards = document.querySelectorAll('.map-card');

  mapCards.forEach(function (card) {
    card.addEventListener('click', function () {
      mapCards.forEach(function (c) { c.classList.remove('active'); });
      card.classList.add('active');
      if (mapInput)    mapInput.value        = card.dataset.map;
      if (summaryMap)  summaryMap.textContent = card.dataset.map;

      const cardMap = document.getElementById('card-map');
      if (cardMap) cardMap.textContent = card.dataset.map;
    });
  });

  /* ─────────────────────────────────────────
     Comandos rápidos
  ───────────────────────────────────────── */
  document.querySelectorAll('[data-action]').forEach(function (button) {
    button.addEventListener('click', async function () {
      const action = button.dataset.action;
      try {
        const result = await sendCommand(action);
        if (commandStatus) {
          commandStatus.textContent = result.message || 'Comando enviado com sucesso.';
          commandStatus.className   = 'status success';
        }
      } catch (_) {
        if (commandStatus) {
          commandStatus.textContent = 'Erro ao enviar comando.';
          commandStatus.className   = 'status error';
        }
      }
    });
  });

});
