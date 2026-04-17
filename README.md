# CS2 CSM Control Center

Projeto reorganizado para uma estrutura moderna com:

- `backend/`: API Node.js com Express
- `frontend/`: app React com Vite e paginas separadas

## Estrutura

- `frontend/src/pages`: paginas principais do painel
- `frontend/src/components`: blocos reutilizaveis da interface
- `frontend/src/context`: estado global da aplicacao
- `backend/src/data`: dados demo e seeds da app
- `backend/src/server.js`: API principal

## Como correr

1. Instalar dependencias:
   `npm install`
   `npm --prefix backend install`
   `npm --prefix frontend install`
2. Iniciar backend:
   `npm run dev:backend`
3. Iniciar frontend:
   `npm run dev:frontend`

Frontend por padrao em `http://localhost:5173` e backend em `http://localhost:3333`.

## Login demo

- `manager / manager123`
- `admin / admin123`
- `arbitro / arbitro123`

## O que mudou

- Migracao do HTML monolitico para React
- Separacao por paginas e componentes
- Criacao de uma API Node.js para auth demo, bootstrap, comandos e configuracao
- UI mais fluida, limpa e facil de evoluir
