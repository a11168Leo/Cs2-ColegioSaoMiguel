import cors from "cors";
import express from "express";
import { liveMatches, maps, quickCommands, rules, scoreboard, servers, teams } from "./data/dashboard.js";
import { users } from "./data/users.js";

const app = express();
const port = Number(process.env.PORT || 3333);

let serverConfigs = servers.map((server) => ({ ...server }));
let commandLog = [];

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "API online", updatedAt: new Date().toISOString() });
});

app.get("/api/bootstrap", (_req, res) => {
  res.json({
    hero: {
      title: "Painel tatico para gerir CS2 com mais clareza",
      subtitle: "Uma base moderna para admins, arbitros e equipas acompanharem servidores, mapas e partidas em tempo real."
    },
    stats: [
      { label: "Servidores ativos", value: serverConfigs.filter((server) => server.status === "online").length },
      { label: "Jogadores preparados", value: teams.reduce((sum, team) => sum + team.players, 0) },
      { label: "Jogos ao vivo", value: liveMatches.length },
      { label: "Mapas prontos", value: maps.length }
    ],
    maps,
    servers: serverConfigs,
    teams,
    liveMatches,
    rules,
    quickCommands,
    scoreboard,
    commandLog
  });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body ?? {};
  const account = users.find(
    (user) => user.username.toLowerCase() === String(username || "").toLowerCase() && user.password === password
  );

  if (!account) {
    return res.status(401).json({ message: "Utilizador ou password incorretos." });
  }

  return res.json({
    user: {
      id: account.id,
      username: account.username,
      role: account.role,
      email: account.email
    }
  });
});

app.get("/api/users", (_req, res) => {
  res.json(users.map(({ password, ...user }) => user));
});

app.post("/api/config", (req, res) => {
  const { serverId, map, totalPlayers, ipAddress } = req.body ?? {};
  const index = serverConfigs.findIndex((server) => server.id === serverId);

  if (index === -1) {
    return res.status(404).json({ message: "Servidor nao encontrado." });
  }

  serverConfigs[index] = {
    ...serverConfigs[index],
    map: map || serverConfigs[index].map,
    totalPlayers: Number(totalPlayers) || serverConfigs[index].totalPlayers,
    ipAddress: ipAddress || serverConfigs[index].ipAddress
  };

  return res.json({
    message: `Configuracao de ${serverConfigs[index].name} atualizada com sucesso.`,
    server: serverConfigs[index]
  });
});

app.post("/api/command", (req, res) => {
  const { action } = req.body ?? {};

  if (!action) {
    return res.status(400).json({ message: "Comando vazio." });
  }

  const entry = {
    id: Date.now(),
    action,
    createdAt: new Date().toISOString(),
    status: "executed"
  };

  commandLog = [entry, ...commandLog].slice(0, 12);

  return res.json({
    message: `Comando "${action}" enviado com sucesso.`,
    command: entry
  });
});

app.listen(port, () => {
  console.log(`CS2 CSM backend running on http://localhost:${port}`);
});
