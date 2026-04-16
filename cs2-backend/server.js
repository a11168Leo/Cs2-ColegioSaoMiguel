// ─── server.js ────────────────────────────────────────────────
//  CS2 Dashboard — Servidor Express principal
// ─────────────────────────────────────────────────────────────
'use strict';
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Rotas da API ──────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/users',    require('./routes/users'));
app.use('/api/servers',  require('./routes/servers'));
app.use('/api/teams',    require('./routes/teams'));
app.use('/api/brackets', require('./routes/brackets'));
app.use('/api/players',  require('./routes/players'));

// ── Rota de config (legacy — mantida para compatibilidade) ─────
app.post('/api/config', (req, res) => {
  const { map, totalPlayers, ipAddress } = req.body;
  console.log('Config recebida:', { map, totalPlayers, ipAddress });
  res.json({ ok: true, message: 'Configuração guardada.' });
});

// ── Rota de comando (legacy) ───────────────────────────────────
app.post('/api/command', (req, res) => {
  const { action } = req.body;
  console.log('Comando recebido:', action);
  const messages = {
    start:   'Servidor iniciado.',
    stop:    'Servidor parado.',
    restart: 'Servidor a reiniciar.',
    warmup:  'Warmup activado.',
    live:    'Modo live activado.',
    knife:   'Ronda de faca iniciada.'
  };
  res.json({ ok: true, message: messages[action] || `Comando "${action}" enviado.` });
});

// ── Servir ficheiros estáticos (HTML/CSS/JS/imagens) ──────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Fallback — SPA (qualquer rota não-API serve index.html) ───
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Iniciar servidor ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  CS2 Dashboard API a correr em http://localhost:${PORT}`);
});
