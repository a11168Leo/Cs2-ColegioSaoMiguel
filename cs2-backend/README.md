# CS2 Dashboard — Backend com MySQL

## Estrutura do Projeto

```
cs2-backend/
├── server.js              # Servidor Express principal
├── db.js                  # Ligação MySQL (pool)
├── package.json
├── .env                   # Configuração (cria a partir de .env.example)
├── .env.example
├── database.sql           # Schema + dados iniciais (executar uma vez)
├── routes/
│   ├── auth.js            # POST /api/auth/login|logout, GET /api/auth/me
│   ├── users.js           # CRUD /api/users (Manager only)
│   ├── servers.js         # CRUD /api/servers
│   ├── teams.js           # CRUD /api/teams
│   ├── brackets.js        # CRUD /api/brackets
│   └── players.js         # CRUD /api/players (scoreboard)
├── middleware/
│   └── auth.js            # Validação de token Bearer
├── php/
│   └── api.php            # API PHP alternativa (mesma BD, hosting LAMP)
└── public/                # Ficheiros estáticos servidos pelo Express
    ├── index.html
    ├── login.html
    ├── manage-accounts.html
    ├── auth.js
    ├── app.js
    ├── styles.css
    └── src/maps/          # Imagens dos mapas
```

---

## Instalação

### 1. Requisitos
- **Node.js** ≥ 18
- **MySQL** ≥ 8 (ou MariaDB ≥ 10.6)

### 2. Base de dados
```bash
mysql -u root -p < database.sql
```
Isto cria a base de dados `cs2csm`, todas as tabelas e 2 contas por defeito:
- `manager` / `manager123` (Manager)
- `admin` / `admin123` (Admin)

### 3. Configuração
```bash
cp .env.example .env
# Edita .env com as tuas credenciais MySQL
```

### 4. Instalar dependências
```bash
npm install
```

### 5. Iniciar o servidor
```bash
npm start
# Desenvolvimento (auto-reload):
npm run dev
```

Abre **http://localhost:3000** no browser.

---

## Autenticação

O sistema usa **tokens Bearer** (UUID gerado no login).

- O token é guardado em `localStorage` (ou `sessionStorage` se "Lembrar" não estiver activo)
- Todas as chamadas à API enviam `Authorization: Bearer <token>`
- As sessões expiram ao fim de 24h (ou 720h com "Lembrar")

---

## API Endpoints

### Auth
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login (devolve token) |
| POST | `/api/auth/logout` | Logout (invalida token) |
| GET  | `/api/auth/me` | Dados do utilizador actual |

### Utilizadores (Manager only)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET    | `/api/users` | Lista todos |
| POST   | `/api/users` | Criar |
| PUT    | `/api/users/:id` | Editar role/email/password |
| DELETE | `/api/users/:id` | Apagar |

### Servidores, Equipas, Brackets, Jogadores
Endpoints similares em `/api/servers`, `/api/teams`, `/api/brackets`, `/api/players`.

---

## PHP (Hosting LAMP)

Se usares Apache/PHP em vez de Node.js, usa `php/api.php`:

1. Coloca os ficheiros de `public/` na raiz do servidor Apache
2. Coloca `php/api.php` em `php/api.php` no servidor
3. Edita as constantes `DB_*` no topo do ficheiro `api.php`
4. No `auth.js` do frontend, altera `API_BASE` para o URL do PHP:
   ```js
   var API_BASE = '/php/api.php?route=';
   ```
   E usa o helper ajustado para PHP:
   ```js
   // Exemplo: apiFetch('auth/login', ...) → fetch('/php/api.php?route=auth/login', ...)
   ```

---

## Permissões por Cargo

| Cargo | Dashboard | Gerir Pessoas |
|-------|-----------|---------------|
| Manager | ✅ Tudo | ✅ Sim |
| Admin | ✅ Tudo | ❌ Não |
| Árbitro | Parcial | ❌ Não |
| Jogador | Parcial | ❌ Não |
