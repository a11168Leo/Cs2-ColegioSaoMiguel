/* ===================== SERVER.JS =====================
   Backend Node.js + Express para CS2-CSM.
   Rotas:
     POST /api/auth/login
     POST /api/auth/logout
     GET  /api/auth/me
     GET  /api/config
     POST /api/config
     POST /api/command
     GET  /api/users          (Manager only)
     POST /api/users          (Manager only)
     DELETE /api/users/:username (Manager only)
   ===================================================== */

'use strict';

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const session    = require('express-session');
const db         = require('./db');          // ← camada de base de dados (ver db.js)

const app  = express();
const PORT = process.env.PORT || 3000;

/* ─────────────────────────────────────────
   Middlewares globais
───────────────────────────────────────── */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'cs2csm_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8   // 8 horas
  }
}));

/* ─────────────────────────────────────────
   Middleware de autenticação
───────────────────────────────────────── */
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }
  next();
}

function requireManager(req, res, next) {
  requireAuth(req, res, function () {
    if (req.session.user.role !== 'Manager') {
      return res.status(403).json({ error: 'Acesso negado. Apenas Manager.' });
    }
    next();
  });
}

/* ─────────────────────────────────────────
   AUTH
───────────────────────────────────────── */
// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Preenche todos os campos.' });
  }

  try {
    const user = await db.findUser(username.toLowerCase().trim());

    if (!user || !(await db.verifyPassword(password, user.password))) {
      return res.status(401).json({ error: 'Utilizador ou password incorretos.' });
    }

    req.session.user = { username: user.username, role: user.role };
    return res.json({ message: 'Login efetuado com sucesso.', user: req.session.user });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Sessão terminada.' });
  });
});

// GET /api/auth/me  — valida sessão e devolve dados do utilizador
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

/* ─────────────────────────────────────────
   CONFIG DO SERVIDOR CS2
───────────────────────────────────────── */
// Estado em memória (substitui por DB se quiseres persistência)
let serverConfig = { map: '', totalPlayers: 0, ipAddress: '' };

app.get('/api/config', requireAuth, (req, res) => {
  res.json(serverConfig);
});

app.post('/api/config', requireAuth, (req, res) => {
  const { map, totalPlayers, ipAddress } = req.body;

  if (!map || !ipAddress || typeof totalPlayers !== 'number') {
    return res.status(400).json({ error: 'Preenche mapa, jogadores e IP.' });
  }

  serverConfig = { map, totalPlayers, ipAddress };
  console.log('Config atualizada:', serverConfig);
  return res.json({ message: 'Configuração salva com sucesso.', config: serverConfig });
});

/* ─────────────────────────────────────────
   COMANDOS RÁPIDOS
───────────────────────────────────────── */
app.post('/api/command', requireAuth, (req, res) => {
  const { action } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Ação é obrigatória.' });
  }

  // TODO: integrar aqui com RCON ou outra API do CS2
  console.log(`Comando: ${action} | Config:`, serverConfig);
  return res.json({ message: `Comando '${action}' enviado para o servidor.` });
});

/* ─────────────────────────────────────────
   GESTÃO DE UTILIZADORES (Manager only)
───────────────────────────────────────── */
app.get('/api/users', requireManager, async (req, res) => {
  try {
    const users = await db.listUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar utilizadores.' });
  }
});

app.post('/api/users', requireManager, async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'username, password e role são obrigatórios.' });
  }

  try {
    await db.upsertUser({ username, email, password, role });
    res.json({ message: `Conta '${username}' criada/atualizada.` });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar/atualizar utilizador.' });
  }
});

app.delete('/api/users/:username', requireManager, async (req, res) => {
  try {
    await db.removeUser(req.params.username);
    res.json({ message: `Conta '${req.params.username}' removida.` });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover utilizador.' });
  }
});

/* ─────────────────────────────────────────
   SPA fallback
───────────────────────────────────────── */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

/* ─────────────────────────────────────────
   Start
───────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`CS2-CSM backend a correr em http://localhost:${PORT}`);
});
