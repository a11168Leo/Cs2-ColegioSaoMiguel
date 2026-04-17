import { useState } from "react";
import SectionCard from "../components/SectionCard";
import { useApp } from "../context/AppContext";

export default function TeamsPage() {
  const { dashboard } = useApp();
  const [view, setView] = useState("list");

  if (!dashboard) {
    return <div className="empty-panel">A carregar equipas...</div>;
  }

  const [topSeed, ...remainingTeams] = dashboard.teams;
  const finalChallenger = remainingTeams[0];
  const waitingTeam = remainingTeams[1];

  return (
    <div className="page-grid">
      <SectionCard
        title="Equipas"
        subtitle="Organizacao"
        actions={(
          <nav className="teams-view-nav" aria-label="Visualizacoes da pagina de equipas">
            <button
              type="button"
              className={`teams-view-button ${view === "bracket" ? "active" : ""}`}
              onClick={() => setView("bracket")}
              aria-label="Ver brackets"
              aria-pressed={view === "bracket"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path fillRule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5zM8.5 5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5zM0 11.5A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm4.5.5A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm4.5.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z" />
              </svg>
            </button>

            <button
              type="button"
              className={`teams-view-button ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
              aria-label="Ver lista de equipas"
              aria-pressed={view === "list"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
              </svg>
            </button>
          </nav>
        )}
      >
        {view === "bracket" ? (
          <div className="teams-bracket" aria-label="Bracket das equipas">
            <section className="bracket-column">
              <p className="eyebrow">Semifinal</p>
              <article className="bracket-card">
                <div className="bracket-team">
                  <span className="team-tag">{finalChallenger?.tag ?? "TBD"}</span>
                  <div>
                    <strong>{finalChallenger?.name ?? "Equipa por definir"}</strong>
                    <small>{finalChallenger ? `${finalChallenger.players} jogadores` : "Aguardando equipa"}</small>
                  </div>
                </div>
                <div className="bracket-versus">VS</div>
                <div className="bracket-team">
                  <span className="team-tag">{waitingTeam?.tag ?? "TBD"}</span>
                  <div>
                    <strong>{waitingTeam?.name ?? "Equipa por definir"}</strong>
                    <small>{waitingTeam ? `${waitingTeam.players} jogadores` : "Aguardando equipa"}</small>
                  </div>
                </div>
              </article>
            </section>

            <section className="bracket-column bracket-column-final">
              <p className="eyebrow">Final</p>
              <article className="bracket-card bracket-card-highlight">
                <div className="bracket-team">
                  <span className="team-tag">{topSeed?.tag ?? "TOP"}</span>
                  <div>
                    <strong>{topSeed?.name ?? "Cabeça de série"}</strong>
                    <small>{topSeed ? `${topSeed.rank} · acesso direto` : "Acesso direto"}</small>
                  </div>
                </div>
                <div className="bracket-versus">VS</div>
                <div className="bracket-team bracket-team-muted">
                  <span className="team-tag">WIN</span>
                  <div>
                    <strong>Vencedor da semifinal</strong>
                    <small>Bracket automático</small>
                  </div>
                </div>
              </article>
            </section>
          </div>
        ) : (
          <div className="team-grid">
            {dashboard.teams.map((team) => (
              <article className="team-card" key={team.id}>
                <div className="team-tag">{team.tag}</div>
                <div>
                  <strong>{team.name}</strong>
                  <p>{team.players} jogadores · {team.rank}</p>
                  <small>Responsavel: {team.responsible}</small>
                </div>
                <span className="team-focus">{team.focus}</span>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
