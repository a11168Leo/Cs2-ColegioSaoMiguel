// ─── routes/players.js (scoreboard) ─────────────────────────
'use strict';
const express = require('express');
const db      = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM sb_players ORDER BY kills DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// POST — guardar lista completa de jogadores
router.post('/', requireAuth, requireRole('Manager', 'Admin', 'Árbitro'), async (req, res) => {
  const { players = [] } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM sb_players');
    for (const p of players) {
      await conn.execute(
        'INSERT INTO sb_players (name, kills, assists, deaths, hs_pct, adr, team) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.name||'', p.kills||0, p.assists||0, p.deaths||0, p.hs_pct||0, p.adr||0, p.team||'']
      );
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Erro ao guardar jogadores.' });
  } finally {
    conn.release();
  }
});

// PUT /api/players/:id — actualizar jogador individual
router.put('/:id', requireAuth, requireRole('Manager', 'Admin', 'Árbitro'), async (req, res) => {
  const { name, kills, assists, deaths, hs_pct, adr, team } = req.body;
  try {
    await db.execute(
      'UPDATE sb_players SET name=?, kills=?, assists=?, deaths=?, hs_pct=?, adr=?, team=? WHERE id=?',
      [name, kills||0, assists||0, deaths||0, hs_pct||0, adr||0, team||'', Number(req.params.id)]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

router.delete('/:id', requireAuth, requireRole('Manager', 'Admin', 'Árbitro'), async (req, res) => {
  try {
    await db.execute('DELETE FROM sb_players WHERE id = ?', [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;
