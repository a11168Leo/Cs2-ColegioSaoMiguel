const form = document.getElementById('server-form');
const statusBox = document.getElementById('status');
const commandStatus = document.getElementById('command-status');
const summaryMap = document.getElementById('summary-map');
const summaryPlayers = document.getElementById('summary-players');
const summaryIp = document.getElementById('summary-ip');
const sidebarItems = document.querySelectorAll('.sidebar-item');

const postConfig = async (config) => {
  const response = await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });

  return response.json();
};

const sendCommand = async (action) => {
  const response = await fetch('/api/command', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });

  return response.json();
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const config = {
    map: document.getElementById('map').value.trim(),
    totalPlayers: Number(document.getElementById('players').value),
    ipAddress: document.getElementById('ip').value.trim()
  };

  try {
    const result = await postConfig(config);
    statusBox.textContent = result.message || 'Configuração salva.';
    statusBox.className = 'status success';
    summaryPlayers.textContent = config.totalPlayers;
    summaryIp.textContent = config.ipAddress || 'não configurado';
  } catch (error) {
    statusBox.textContent = 'Erro ao salvar configuração.';
    statusBox.className = 'status error';
  }
});

const mapInput = document.getElementById('map');
const mapCards = document.querySelectorAll('.map-card');

mapCards.forEach((card) => {
  card.addEventListener('click', () => {
    mapCards.forEach((item) => item.classList.remove('active'));
    card.classList.add('active');
    mapInput.value = card.dataset.map;
    summaryMap.textContent = card.dataset.map;
  });
});

sidebarItems.forEach((item) => {
  item.addEventListener('click', () => {
    sidebarItems.forEach((button) => button.classList.remove('active'));
    item.classList.add('active');
  });
});

const buttons = document.querySelectorAll('[data-action]');
buttons.forEach((button) => {
  button.addEventListener('click', async () => {
    const action = button.dataset.action;

    try {
      const result = await sendCommand(action);
      commandStatus.textContent = result.message || 'Comando enviado.';
      commandStatus.className = 'status success';
    } catch (error) {
      commandStatus.textContent = 'Erro ao enviar comando.';
      commandStatus.className = 'status error';
    }
  });
});
