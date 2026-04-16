// ─── routes/users.js ─────────────────────────────────────────
'use strict';
const express = require('express');
const bcrypt  = require('bcrypt');
const db      = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router  = express.Router();
const manOnly = [requireAuth, requireRole('Manager')];

// ─── GET /api/users ────── lista todos (Manager) ──────────────
router.get('/', ...manOnly, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, username, email, role, created_at FROM users ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// ─── POST /api/users ──── criar utilizador (Manager) ─────────
router.post('/', ...manOnly, async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password são obrigatórios.' });
  }
  const validRoles = ['Manager', 'Admin', 'Árbitro', 'Jogador', 'Espectador'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Cargo inválido.' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username.toLowerCase(), email || null, hash, role || 'Jogador']
    );
    res.status(201).json({ id: result.insertId, username: username.toLowerCase(), email, role: role || 'Jogador' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username ou email já existe.' });
    }
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// ─── PUT /api/users/:id ── actualizar (Manager) ───────────────
router.put('/:id', ...manOnly, async (req, res) => {
  const { role, email, password } = req.body;
  const id = Number(req.params.id);
  try {
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
    }
    if (role)  await db.execute('UPDATE users SET role  = ? WHERE id = ?', [role, id]);
    if (email) await db.execute('UPDATE users SET email = ? WHERE id = ?', [email, id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// ─── DELETE /api/users/:id ── apagar (Manager) ────────────────
router.delete('/:id', ...manOnly, async (req, res) => {
  const id = Number(req.params.id);
  // Não pode apagar a si próprio
  if (id === req.session.user_id) {
    return res.status(400).json({ error: 'Não podes apagar a tua própria conta.' });
  }
  try {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;
