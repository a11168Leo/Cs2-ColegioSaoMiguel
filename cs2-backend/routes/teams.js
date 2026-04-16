// ─── routes/teams.js ─────────────────────────────────────────
'use strict';
const express = require('express');
const db      = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM teams ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

router.post('/', requireAuth, requireRole('Manager', 'Admin'), async (req, res) => {
  const { name, country, flag, logo } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório.' });
  try {
    const [result] = await db.execute(
      'INSERT INTO teams (name, country, flag, logo) VALUES (?, ?, ?, ?)',
      [name, country || '', flag || '', logo || '']
    );
    res.status(201).json({ id: result.insertId, name, country, flag, logo });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

router.put('/:id', requireAuth, requireRole('Manager', 'Admin'), async (req, res) => {
  const { name, country, flag, logo } = req.body;
  const id = Number(req.params.id);
  try {
    await db.execute(
      'UPDATE teams SET name=?, country=?, flag=?, logo=? WHERE id=?',
      [name, country || '', flag || '', logo || '', id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

router.delete('/:id', requireAuth, requireRole('Manager', 'Admin'), async (req, res) => {
  try {
    await db.execute('DELETE FROM teams WHERE id = ?', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;
