(function () {
  'use strict';

  function readUsers() {
    return JSON.parse(localStorage.getItem('cs2csm_users') || '{}');
  }

  function saveUsers(users) {
    localStorage.setItem('cs2csm_users', JSON.stringify(users));
  }

  function encodePassword(password) {
    return btoa(password);
  }

  function normalizeUsername(username) {
    return String(username || '').trim().toLowerCase();
  }

  function upsertUser(user) {
    const users = readUsers();
    const key = normalizeUsername(user.username);

    if (!key) {
      console.error('Username inválido.');
      return;
    }

    users[key] = {
      username: String(user.username || '').trim(),
      email: String(user.email || '').trim(),
      password: encodePassword(String(user.password || '')),
      role: String(user.role || 'Jogador').trim()
    };

    saveUsers(users);
    console.log(`Conta criada/atualizada: ${user.username}`);
  }

  function removeUser(username) {
    const users = readUsers();
    const key = normalizeUsername(username);

    if (!users[key]) {
      console.warn(`Utilizador não encontrado: ${username}`);
      return;
    }

    delete users[key];
    saveUsers(users);
    console.log(`Conta removida: ${username}`);
  }

  function listUsers() {
    const users = readUsers();
    console.table(Object.values(users).map(function (u) {
      return {
        username: u.username,
        email: u.email,
        role: u.role
      };
    }));
  }

  function clearUsers() {
    localStorage.removeItem('cs2csm_users');
    console.log('Todas as contas foram removidas.');
  }

  window.dashboardUsers = {
    upsertUser,
    removeUser,
    listUsers,
    clearUsers
  };

  /* CONTAS INICIAIS */
  dashboardUsers.upsertUser({
    username: 'admin',
    email: 'admin@cs2csm.local',
    password: 'Admin@123',
    role: 'Admin'
  });

  dashboardUsers.upsertUser({
    username: 'arbitro1',
    email: 'arbitro1@cs2csm.local',
    password: 'Arbitro@123',
    role: 'Árbitro'
  });

  dashboardUsers.listUsers();
})();
