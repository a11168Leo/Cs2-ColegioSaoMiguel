import SectionCard from "../components/SectionCard";
import { useApp } from "../context/AppContext";

export default function TeamsPage() {
  const { dashboard } = useApp();

  if (!dashboard) {
    return <div className="empty-panel">A carregar equipas...</div>;
  }

  return (
    <div className="page-grid">
      <SectionCard title="Equipas" subtitle="Organizacao">
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
      </SectionCard>
    </div>
  );
}
