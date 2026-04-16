-- ============================================================
--  CS2 Dashboard — MySQL Database Schema
--  Run this file once to set up the database.
--  mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS cs2csm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cs2csm;

-- ─────────────────────────────────────────
--  USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(50)  UNIQUE NOT NULL,
  email        VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role         ENUM('Manager','Admin') DEFAULT 'Admin',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  SESSIONS (token-based)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  token      VARCHAR(128) PRIMARY KEY,
  user_id    INT NOT NULL,
  username   VARCHAR(50) NOT NULL,
  role       VARCHAR(50) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────
--  SERVERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS servers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100),
  ip          VARCHAR(50)  NOT NULL,
  port        INT DEFAULT 27015,
  map         VARCHAR(50),
  max_players INT DEFAULT 10,
  password    VARCHAR(100),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  TEAMS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  country    VARCHAR(50),
  flag       VARCHAR(10),
  logo       VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  BRACKETS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brackets (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  match_id VARCHAR(50) UNIQUE NOT NULL,
  team_a   VARCHAR(100),
  team_b   VARCHAR(100),
  score_a  INT DEFAULT 0,
  score_b  INT DEFAULT 0,
  phase    VARCHAR(50),
  winner   VARCHAR(100),
  pos_x    FLOAT DEFAULT 0,
  pos_y    FLOAT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bracket_connections (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  from_match VARCHAR(50),
  to_match   VARCHAR(50)
);

-- ─────────────────────────────────────────
--  SCOREBOARD PLAYERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sb_players (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(100),
  kills  INT DEFAULT 0,
  assists INT DEFAULT 0,
  deaths INT DEFAULT 0,
  hs_pct FLOAT DEFAULT 0,
  adr    FLOAT DEFAULT 0,
  team   VARCHAR(50)
);

-- ─────────────────────────────────────────
--  SEED: default accounts
--  Passwords are bcrypt hashes:
--    Manager: manager123
--    Admin:   admin123
-- ─────────────────────────────────────────
INSERT IGNORE INTO users (username, email, password_hash, role) VALUES
  ('manager', 'manager@cs2csm.pt', '$2b$10$rIXUKfVY6Yk7G.T7Y7R.XeZjrPfxCRxMqENFWeFzuTnEy9BkMtxGu', 'Manager'),
  ('admin',   'admin@cs2csm.pt',   '$2b$10$eImiTXuWVxfM37uY9WX9Ue59LXR9lnQWygqvNXLaHp9BMjBpT7GtO', 'Admin');

-- ─────────────────────────────────────────
--  SEED: default servers
-- ─────────────────────────────────────────
INSERT IGNORE INTO servers (name, ip, port, map, max_players) VALUES
  ('Servidor Principal', '192.168.1.100', 27015, 'de_mirage', 10),
  ('Servidor Treino',    '192.168.1.101', 27015, 'de_dust2',  10);
