// ─── routes/servers.js ───────────────────────────────────────
'use strict';
const express = require('express');
const db      = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/servers — qualquer autenticado
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM servers ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// POST /api/servers — Admin ou Manager
router.post('/', requireAuth, requireRole('Manager', 'Admin'), async (req, res) => {
  const { name, ip, port, map, max_players, password } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP é obrigatório.' });
  try {
    const [result] = await db.execute(
      'INSERT INTO servers (name, ip, port, map, max_players, password) VALUES (?, ?, ?, ?, ?, ?)',
      [name || '', ip, port || 27015, map || '', max_players || 10, password || '']
    );
    res.status(201).json({ id: result.insertId, name, ip, port, map, max_players });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// PUT /api/servers/:id
router.put('/:id', requireAuth, requireRole('Manager', 'Admin'), async (req, res) => {
  const { name, ip, port, map, max_players, password } = req.body;
  const id = Number(req.params.id);
  try {
    await db.execute(
      'UPDATE servers SET name=?, ip=?, port=?, map=?, max_players=?, password=? WHERE id=?',
      [name, ip, port || 27015, map, max_players || 10, password || '', id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// DELETE /api/servers/:id
router.delete('/:id', requireAuth, requireRole('Manager', 'Admin'), async (req, res) => {
  try {
    await db.execute('DELETE FROM servers WHERE id = ?', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;
