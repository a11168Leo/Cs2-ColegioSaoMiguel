const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

let serverConfig = {
  map: '',
  totalPlayers: 0,
  ipAddress: ''
};

app.get('/api/config', (req, res) => {
  res.json(serverConfig);
});

app.post('/api/config', (req, res) => {
  const { map, totalPlayers, ipAddress } = req.body;

  if (!map || !ipAddress || typeof totalPlayers !== 'number') {
    return res.status(400).json({ error: 'Preencha mapa, total de jogadores e IP corretamente.' });
  }

  serverConfig = { map, totalPlayers, ipAddress };
  console.log('Configuração do servidor atualizada:', serverConfig);

  return res.json({ message: 'Configuração salva com sucesso.', config: serverConfig });
});

app.post('/api/command', (req, res) => {
  const { action } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'A ação do comando é obrigatória.' });
  }

  // Aqui você poderá adicionar a integração real com o servidor CS2.
  console.log(`Comando recebido: ${action}`);
  console.log('Usando configuração:', serverConfig);

  return res.json({ message: `Comando '${action}' enviado para o servidor.`, config: serverConfig });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});
