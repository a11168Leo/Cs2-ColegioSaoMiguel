// ─── routes/auth.js ──────────────────────────────────────────
'use strict';
const express = require('express');
const bcrypt  = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db      = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password, remember } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Preenche todos os campos.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username.toLowerCase()]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'Utilizador ou password incorretos.' });
    }
    const user = rows[0];
    const ok   = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Utilizador ou password incorretos.' });
    }

    // Criar token de sessão
    const token   = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
    const hours   = remember ? (Number(process.env.SESSION_HOURS) || 720) : 24;
    const expires = new Date(Date.now() + hours * 3600 * 1000);

    await db.execute(
      'INSERT INTO sessions (token, user_id, username, role, expires_at) VALUES (?, ?, ?, ?, ?)',
      [token, user.id, user.username, user.role, expires]
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────
router.post('/logout', requireAuth, async (req, res) => {
  try {
    await db.execute('DELETE FROM sessions WHERE token = ?', [req.session.token]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id:       req.session.user_id,
      username: req.session.username,
      role:     req.session.role
    }
  });
});

module.exports = router;
