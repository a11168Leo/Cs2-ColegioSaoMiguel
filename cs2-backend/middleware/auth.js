// ─── middleware/auth.js ────────────────────────────────────────
//  Valida o token Bearer em cada request protegido
// ──────────────────────────────────────────────────────────────
'use strict';
const db = require('../db');

async function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }
    req.session = rows[0]; // { token, user_id, username, role, expires_at }
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Erro interno.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !roles.includes(req.session.role)) {
      return res.status(403).json({ error: 'Sem permissão.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
