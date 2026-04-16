<?php
/**
 * CS2 Dashboard — PHP API (alternativa ao Node.js)
 * Usa a mesma base de dados MySQL.
 *
 * Configuração: edita as constantes DB_* abaixo.
 * Coloca este ficheiro no teu servidor PHP (ex: Apache/Nginx).
 * URL base: https://teu-servidor.com/php/api.php
 *
 * Endpoints (idênticos ao Node.js):
 *   POST /php/api.php?route=auth/login
 *   POST /php/api.php?route=auth/logout
 *   GET  /php/api.php?route=auth/me
 *   GET  /php/api.php?route=users
 *   POST /php/api.php?route=users
 *   PUT  /php/api.php?route=users&id=1
 *   DELETE /php/api.php?route=users&id=1
 *   GET  /php/api.php?route=servers
 *   POST /php/api.php?route=servers
 *   ...
 */

// ─── Configuração da Base de Dados ──────────────────────────
define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_USER', 'root');
define('DB_PASS', 'a_tua_password');
define('DB_NAME', 'cs2csm');
define('SESSION_HOURS', 24);

// ─── CORS e JSON headers ─────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// ─── Ligação MySQL ────────────────────────────────────────────
try {
    $pdo = new PDO(
        "mysql:host=".DB_HOST.";port=".DB_PORT.";dbname=".DB_NAME.";charset=utf8mb4",
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro de ligação à base de dados.']);
    exit;
}

// ─── Helpers ─────────────────────────────────────────────────
function jsonBody() {
    $body = file_get_contents('php://input');
    return json_decode($body, true) ?: [];
}

function getToken() {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (str_starts_with($header, 'Bearer ')) {
        return substr($header, 7);
    }
    return null;
}

function validateSession($pdo) {
    $token = getToken();
    if (!$token) { http_response_code(401); echo json_encode(['error' => 'Não autenticado.']); exit; }
    $stmt = $pdo->prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > NOW()');
    $stmt->execute([$token]);
    $session = $stmt->fetch();
    if (!$session) { http_response_code(401); echo json_encode(['error' => 'Sessão inválida ou expirada.']); exit; }
    return $session;
}

function requireRole($session, ...$roles) {
    if (!in_array($session['role'], $roles)) {
        http_response_code(403); echo json_encode(['error' => 'Sem permissão.']); exit;
    }
}

function generateToken() {
    return bin2hex(random_bytes(32));
}

// ─── Roteador ────────────────────────────────────────────────
$route  = $_GET['route'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;
$body   = jsonBody();

// ════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════
if ($route === 'auth/login' && $method === 'POST') {
    $username = strtolower(trim($body['username'] ?? ''));
    $password = $body['password'] ?? '';
    $remember = !empty($body['remember']);

    if (!$username || !$password) {
        http_response_code(400); echo json_encode(['error' => 'Preenche todos os campos.']); exit;
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401); echo json_encode(['error' => 'Utilizador ou password incorretos.']); exit;
    }

    $token   = generateToken();
    $hours   = $remember ? (SESSION_HOURS * 30) : SESSION_HOURS;
    $expires = date('Y-m-d H:i:s', time() + $hours * 3600);

    $pdo->prepare('INSERT INTO sessions (token, user_id, username, role, expires_at) VALUES (?, ?, ?, ?, ?)')
        ->execute([$token, $user['id'], $user['username'], $user['role'], $expires]);

    echo json_encode([
        'token' => $token,
        'user'  => ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role'], 'email' => $user['email']]
    ]);
    exit;
}

if ($route === 'auth/logout' && $method === 'POST') {
    $session = validateSession($pdo);
    $pdo->prepare('DELETE FROM sessions WHERE token = ?')->execute([$session['token']]);
    echo json_encode(['ok' => true]); exit;
}

if ($route === 'auth/me' && $method === 'GET') {
    $session = validateSession($pdo);
    echo json_encode(['user' => ['id' => $session['user_id'], 'username' => $session['username'], 'role' => $session['role']]]);
    exit;
}

// ════════════════════════════════════════
//  USERS
// ════════════════════════════════════════
if ($route === 'users') {
    $session = validateSession($pdo);

    if ($method === 'GET') {
        requireRole($session, 'Manager');
        $rows = $pdo->query('SELECT id, username, email, role, created_at FROM users ORDER BY id')->fetchAll();
        echo json_encode($rows); exit;
    }

    if ($method === 'POST') {
        requireRole($session, 'Manager');
        $username = strtolower(trim($body['username'] ?? ''));
        $password = $body['password'] ?? '';
        $email    = $body['email'] ?? null;
        $role     = $body['role'] ?? 'Jogador';
        if (!$username || !$password) { http_response_code(400); echo json_encode(['error' => 'Username e password são obrigatórios.']); exit; }
        $hash = password_hash($password, PASSWORD_BCRYPT);
        try {
            $stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)');
            $stmt->execute([$username, $email, $hash, $role]);
            echo json_encode(['id' => $pdo->lastInsertId(), 'username' => $username, 'email' => $email, 'role' => $role]);
        } catch (PDOException $e) {
            http_response_code(409); echo json_encode(['error' => 'Username ou email já existe.']);
        }
        exit;
    }

    if ($method === 'PUT' && $id) {
        requireRole($session, 'Manager');
        if (!empty($body['password'])) {
            $pdo->prepare('UPDATE users SET password_hash=? WHERE id=?')->execute([password_hash($body['password'], PASSWORD_BCRYPT), $id]);
        }
        if (!empty($body['role']))  $pdo->prepare('UPDATE users SET role=?  WHERE id=?')->execute([$body['role'],  $id]);
        if (!empty($body['email'])) $pdo->prepare('UPDATE users SET email=? WHERE id=?')->execute([$body['email'], $id]);
        echo json_encode(['ok' => true]); exit;
    }

    if ($method === 'DELETE' && $id) {
        requireRole($session, 'Manager');
        if ($id === (int)$session['user_id']) { http_response_code(400); echo json_encode(['error' => 'Não podes apagar a tua conta.']); exit; }
        $pdo->prepare('DELETE FROM users WHERE id=?')->execute([$id]);
        echo json_encode(['ok' => true]); exit;
    }
}

// ════════════════════════════════════════
//  SERVERS
// ════════════════════════════════════════
if ($route === 'servers') {
    $session = validateSession($pdo);

    if ($method === 'GET') {
        echo json_encode($pdo->query('SELECT * FROM servers ORDER BY id')->fetchAll()); exit;
    }
    if ($method === 'POST') {
        requireRole($session, 'Manager', 'Admin');
        $stmt = $pdo->prepare('INSERT INTO servers (name, ip, port, map, max_players, password) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([$body['name']??'', $body['ip']??'', $body['port']??27015, $body['map']??'', $body['max_players']??10, $body['password']??'']);
        echo json_encode(['id' => $pdo->lastInsertId()]); exit;
    }
    if ($method === 'PUT' && $id) {
        requireRole($session, 'Manager', 'Admin');
        $pdo->prepare('UPDATE servers SET name=?,ip=?,port=?,map=?,max_players=?,password=? WHERE id=?')
            ->execute([$body['name']??'', $body['ip']??'', $body['port']??27015, $body['map']??'', $body['max_players']??10, $body['password']??'', $id]);
        echo json_encode(['ok' => true]); exit;
    }
    if ($method === 'DELETE' && $id) {
        requireRole($session, 'Manager', 'Admin');
        $pdo->prepare('DELETE FROM servers WHERE id=?')->execute([$id]);
        echo json_encode(['ok' => true]); exit;
    }
}

// ════════════════════════════════════════
//  TEAMS
// ════════════════════════════════════════
if ($route === 'teams') {
    $session = validateSession($pdo);
    if ($method === 'GET') {
        echo json_encode($pdo->query('SELECT * FROM teams ORDER BY id')->fetchAll()); exit;
    }
    if ($method === 'POST') {
        requireRole($session, 'Manager', 'Admin');
        $stmt = $pdo->prepare('INSERT INTO teams (name, country, flag, logo) VALUES (?, ?, ?, ?)');
        $stmt->execute([$body['name']??'', $body['country']??'', $body['flag']??'', $body['logo']??'']);
        echo json_encode(['id' => $pdo->lastInsertId()]); exit;
    }
    if ($method === 'PUT' && $id) {
        requireRole($session, 'Manager', 'Admin');
        $pdo->prepare('UPDATE teams SET name=?,country=?,flag=?,logo=? WHERE id=?')
            ->execute([$body['name']??'', $body['country']??'', $body['flag']??'', $body['logo']??'', $id]);
        echo json_encode(['ok' => true]); exit;
    }
    if ($method === 'DELETE' && $id) {
        requireRole($session, 'Manager', 'Admin');
        $pdo->prepare('DELETE FROM teams WHERE id=?')->execute([$id]);
        echo json_encode(['ok' => true]); exit;
    }
}

// ════════════════════════════════════════
//  BRACKETS
// ════════════════════════════════════════
if ($route === 'brackets') {
    $session = validateSession($pdo);
    if ($method === 'GET') {
        $matches = $pdo->query('SELECT * FROM brackets ORDER BY id')->fetchAll();
        $conns   = $pdo->query('SELECT * FROM bracket_connections')->fetchAll();
        echo json_encode(['matches' => $matches, 'connections' => $conns]); exit;
    }
    if ($method === 'POST') {
        requireRole($session, 'Manager', 'Admin');
        $pdo->exec('DELETE FROM bracket_connections');
        $pdo->exec('DELETE FROM brackets');
        foreach (($body['matches'] ?? []) as $m) {
            $pdo->prepare('INSERT INTO brackets (match_id,team_a,team_b,score_a,score_b,phase,winner,pos_x,pos_y) VALUES (?,?,?,?,?,?,?,?,?)')
                ->execute([$m['match_id'], $m['team_a']??'TBD', $m['team_b']??'TBD', $m['score_a']??0, $m['score_b']??0, $m['phase']??'', $m['winner']??'', $m['pos_x']??0, $m['pos_y']??0]);
        }
        foreach (($body['connections'] ?? []) as $c) {
            $pdo->prepare('INSERT INTO bracket_connections (from_match,to_match) VALUES (?,?)')->execute([$c['from_match'], $c['to_match']]);
        }
        echo json_encode(['ok' => true]); exit;
    }
}

// ════════════════════════════════════════
//  PLAYERS (scoreboard)
// ════════════════════════════════════════
if ($route === 'players') {
    $session = validateSession($pdo);
    if ($method === 'GET') {
        echo json_encode($pdo->query('SELECT * FROM sb_players ORDER BY kills DESC')->fetchAll()); exit;
    }
    if ($method === 'POST') {
        requireRole($session, 'Manager', 'Admin', 'Árbitro');
        $pdo->exec('DELETE FROM sb_players');
        foreach (($body['players'] ?? []) as $p) {
            $pdo->prepare('INSERT INTO sb_players (name,kills,assists,deaths,hs_pct,adr,team) VALUES (?,?,?,?,?,?,?)')
                ->execute([$p['name']??'', $p['kills']??0, $p['assists']??0, $p['deaths']??0, $p['hs_pct']??0, $p['adr']??0, $p['team']??'']);
        }
        echo json_encode(['ok' => true]); exit;
    }
}

// 404 fallback
http_response_code(404);
echo json_encode(['error' => 'Rota não encontrada.']);
