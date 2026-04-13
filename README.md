# Painel CS2 Server

Projeto inicial para um painel de controle que configura mapa, total de jogadores e IP de um servidor CS2.

## Como executar

1. Abra um terminal em `backend`.
2. Rode `npm install`.
3. Rode `npm start`.
4. Acesse `http://localhost:3000` no navegador.

## O que foi criado

- `backend/server.js`: backend Express com API para salvar a configuração e enviar comandos.
- `frontend/index.html`: painel com formulário para mapa, jogadores e IP.
- `frontend/app.js`: lógica do frontend para chamar a API.
- `frontend/styles.css`: estilos básicos do painel.

## Próximo passo

Implementar a integração real com o servidor CS2 usando os valores de `map`, `totalPlayers` e `ipAddress`.
