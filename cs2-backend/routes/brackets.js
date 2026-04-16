// ─── routes/brackets.js ──────────────────────────────────────
'use strict';
const express = require('express');
const db      = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET — obter todos os matches + conexões
router.get('/', requireAuth, async (req, res) => {
  try {
    const [matches] = await db.execute('SELECT * FROM brackets ORDER BY id');
    const [conns]   = await db.execute('SELECT * FROM bracket_connections');
    res.json({ matches, connections: conns });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// POST — guardar estado completo dos brackets (substitui tudo)
router.post('/', requireAuth, requireRole('Manager', 'Admin'), async (req, res) => {
  const { matches = [], connections = [] } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute('DELETE FROM bracket_connections');
    await conn.execute('DELETE FROM brackets');

    for (const m of matches) {
      await conn.execute(
        `INSERT INTO brackets (match_id, team_a, team_b, score_a, score_b, phase, winner, pos_x, pos_y)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [m.match_id, m.team_a||'TBD', m.team_b||'TBD', m.score_a||0, m.score_b||0,
         m.phase||'', m.winner||'', m.pos_x||0, m.pos_y||0]
      );
    }
    for (const c of connections) {
      await conn.execute(
        'INSERT INTO bracket_connections (from_match, to_match) VALUES (?, ?)',
        [c.from_match, c.to_match]
      );
    }
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Erro ao guardar brackets.' });
  } finally {
    conn.release();
  }
});

// PUT /api/brackets/:matchId — actualizar um match específico
router.put('/:matchId', requireAuth, requireRole('Manager', 'Admin', 'Árbitro'), async (req, res) => {
  const { team_a, team_b, score_a, score_b, phase, winner, pos_x, pos_y } = req.body;
  try {
    await db.execute(
      `UPDATE brackets SET team_a=?, team_b=?, score_a=?, score_b=?, phase=?, winner=?, pos_x=?, pos_y=?
       WHERE match_id=?`,
      [team_a||'TBD', team_b||'TBD', score_a||0, score_b||0,
       phase||'', winner||'', pos_x||0, pos_y||0, req.params.matchId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// DELETE /api/brackets/:matchId
router.delete('/:matchId', requireAuth, requireRole('Manager', 'Admin'), async (req, res) => {
  try {
    await db.execute('DELETE FROM brackets WHERE match_id = ?', [req.params.matchId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;
