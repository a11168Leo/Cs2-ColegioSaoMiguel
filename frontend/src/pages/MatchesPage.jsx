import SectionCard from "../components/SectionCard";
import { useApp } from "../context/AppContext";

export default function MatchesPage() {
  const { dashboard } = useApp();

  if (!dashboard) {
    return <div className="empty-panel">A carregar partidas...</div>;
  }

  return (
    <div className="page-grid">
      <SectionCard title="Live matches" subtitle="Ritmo do torneio">
        <div className="match-grid">
          {dashboard.liveMatches.map((match) => (
            <article className="match-card" key={match.id}>
              <div className="match-head">
                <span className="badge badge-live">{match.status}</span>
                <small>{match.round}</small>
              </div>
              <strong>{match.teams.join(" vs ")}</strong>
              <p>{match.map}</p>
              <div className="match-score">{match.score}</div>
              <small>{match.summary}</small>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Scoreboard" subtitle="Snapshot atual">
        <div className="scoreboard-card">
          <div>
            <span>{dashboard.scoreboard.ct.name}</span>
            <strong>{dashboard.scoreboard.ct.score}</strong>
          </div>
          <div className="scoreboard-divider">
            <small>{dashboard.scoreboard.map}</small>
            <strong>Round {dashboard.scoreboard.round}</strong>
          </div>
          <div>
            <span>{dashboard.scoreboard.t.name}</span>
            <strong>{dashboard.scoreboard.t.score}</strong>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
