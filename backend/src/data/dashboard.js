export const maps = [
  { id: "mirage", name: "Mirage", pool: "Active Duty", mode: "Tactical", difficulty: "Alta", image: "/src/maps/Mirage.jpg" },
  { id: "inferno", name: "Inferno", pool: "Active Duty", mode: "Classic", difficulty: "Media", image: "/src/maps/Inferno.jpg" },
  { id: "ancient", name: "Ancient", pool: "Active Duty", mode: "Control", difficulty: "Alta", image: "/src/maps/Ancient.jpg" },
  { id: "anubis", name: "Anubis", pool: "Active Duty", mode: "Explosive", difficulty: "Media", image: "/src/maps/Anubis.jpg" },
  { id: "nuke", name: "Nuke", pool: "Active Duty", mode: "Vertical", difficulty: "Alta", image: "/src/maps/Nuke.png" },
  { id: "overpass", name: "Overpass", pool: "Reserve", mode: "Hybrid", difficulty: "Media", image: "/src/maps/Overpass.webp" },
  { id: "dust2", name: "Dust II", pool: "Classic", mode: "Entry", difficulty: "Baixa", image: "/src/maps/Dust2.jpg" }
];

export const servers = [
  { id: "srv-lisboa", name: "Arena Lisboa", ipAddress: "10.10.40.21", totalPlayers: 10, map: "Mirage", status: "online", tickrate: "128", region: "PT-LX", latency: "12ms" },
  { id: "srv-porto", name: "Arena Porto", ipAddress: "10.10.40.34", totalPlayers: 10, map: "Inferno", status: "online", tickrate: "128", region: "PT-OPO", latency: "16ms" },
  { id: "srv-lab", name: "Laboratorio Escolar", ipAddress: "10.10.40.58", totalPlayers: 12, map: "Ancient", status: "maintenance", tickrate: "64", region: "LAB", latency: "31ms" }
];

export const teams = [
  { id: "alpha", name: "Equipe Alpha", tag: "ALP", flag: "PT", responsible: "Prof. Rui", players: 5, rank: "#1", focus: "Tatica e retake" },
  { id: "bravo", name: "Equipe Bravo", tag: "BRV", flag: "PT", responsible: "Prof. Sara", players: 5, rank: "#2", focus: "Entry e execucoes" },
  { id: "charlie", name: "Equipe Charlie", tag: "CHR", flag: "PT", responsible: "Prof. Joao", players: 6, rank: "#3", focus: "Academia e scrims" }
];

export const liveMatches = [
  { id: 1, map: "Mirage", round: "Round 14 / 24", status: "Ao vivo", score: "8 : 6", teams: ["Alpha", "Bravo"], summary: "Jogo equilibrado com vantagem ligeira para a Alpha." },
  { id: 2, map: "Inferno", round: "Round 9 / 24", status: "Ao vivo", score: "4 : 5", teams: ["Charlie", "Academia"], summary: "Partida aberta com ritmo alto e muitos trades." }
];

export const rules = [
  { id: "competicao", title: "Competicao", items: ["Check-in obrigatorio 15 minutos antes da partida.", "O capitao confirma mapa e lineup no painel.", "Ausencia de equipa gera derrota administrativa."] },
  { id: "servidor", title: "Servidor", items: ["Restart tecnico autorizado apenas pelo arbitro.", "Comandos rapidos ficam registados no painel.", "Alteracoes de mapa e slots devem ser comunicadas."] },
  { id: "conduta", title: "Conduta", items: ["Chat toxico e insultos resultam em advertencia.", "Uso indevido de contas sera revisto pela administracao.", "Toda a gestao deve ficar centralizada no painel."] }
];

export const quickCommands = [
  { id: "restart", label: "Restart Match", action: "mp_restartgame 1", description: "Reinicia a partida com feedback imediato." },
  { id: "warmup", label: "Warmup", action: "mp_warmup_start", description: "Ativa warmup para preparar equipas." },
  { id: "knife", label: "Knife Round", action: "exec knife_round.cfg", description: "Carrega config rapida de knife round." },
  { id: "backup", label: "Backup", action: "tv_record backup_auto", description: "Regista o estado da sessao atual." }
];

export const scoreboard = {
  ct: { name: "Equipe Alpha", score: 11 },
  t: { name: "Equipe Bravo", score: 9 },
  round: 21,
  map: "Mirage"
};
