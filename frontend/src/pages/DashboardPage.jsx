import SectionCard from "../components/SectionCard";
import StatGrid from "../components/StatGrid";
import { useApp } from "../context/AppContext";

export default function DashboardPage() {
  const { dashboard, loading, runCommand } = useApp();

  if (loading || !dashboard) {
    return <div className="empty-panel">A carregar dashboard...</div>;
  }

  return (
    <div className="page-grid">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Visao geral</p>
          <h3>{dashboard.hero.title}</h3>
          <p>{dashboard.hero.subtitle}</p>
        </div>
      </section>

      <StatGrid items={dashboard.stats} />

      <SectionCard title="Map pool" subtitle="Selecao visual">
        <div className="map-grid">
          {dashboard.maps.map((map) => (
            <article className="map-card" key={map.id} style={{ backgroundImage: `linear-gradient(180deg, rgba(12,16,24,.2), rgba(12,16,24,.85)), url(${map.image})` }}>
              <span>{map.pool}</span>
              <strong>{map.name}</strong>
              <small>{map.mode} · {map.difficulty}</small>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Comandos rapidos" subtitle="Acao imediata">
        <div className="command-list">
          {dashboard.quickCommands.map((command) => (
            <article className="command-card" key={command.id}>
              <div>
                <strong>{command.label}</strong>
                <p>{command.description}</p>
                <code>{command.action}</code>
              </div>
              <button className="ghost-button" onClick={() => runCommand(command.action)}>Executar</button>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Regras principais" subtitle="Governanca">
        <div className="rules-grid">
          {dashboard.rules.map((rule) => (
            <article className="rule-card" key={rule.id}>
              <strong>{rule.title}</strong>
              <ul>
                {rule.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
