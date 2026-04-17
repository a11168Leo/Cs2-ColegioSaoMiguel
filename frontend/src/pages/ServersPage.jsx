import { useEffect, useState } from "react";
import SectionCard from "../components/SectionCard";
import { useApp } from "../context/AppContext";

export default function ServersPage() {
  const { dashboard, updateServerConfig } = useApp();
  const [form, setForm] = useState({ serverId: "", map: "", totalPlayers: 10, ipAddress: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (dashboard?.servers?.length) {
      const server = dashboard.servers[0];
      setForm({
        serverId: server.id,
        map: server.map,
        totalPlayers: server.totalPlayers,
        ipAddress: server.ipAddress
      });
    }
  }, [dashboard]);

  if (!dashboard) {
    return <div className="empty-panel">A carregar servidores...</div>;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const result = await updateServerConfig(form);
    setMessage(result.message);
  }

  return (
    <div className="page-grid">
      <SectionCard title="Servidores" subtitle="Estado atual">
        <div className="server-grid">
          {dashboard.servers.map((server) => (
            <article className="server-card" key={server.id}>
              <div className="server-top">
                <strong>{server.name}</strong>
                <span className={`badge badge-${server.status}`}>{server.status}</span>
              </div>
              <p>{server.ipAddress}</p>
              <small>{server.map} · {server.totalPlayers} slots · {server.tickrate} tick</small>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Editar configuracao" subtitle="Node API">
        <form className="config-form" onSubmit={handleSubmit}>
          <label>
            Servidor
            <select value={form.serverId} onChange={(event) => {
              const selected = dashboard.servers.find((item) => item.id === event.target.value);
              setForm({
                serverId: selected.id,
                map: selected.map,
                totalPlayers: selected.totalPlayers,
                ipAddress: selected.ipAddress
              });
            }}>
              {dashboard.servers.map((server) => (
                <option key={server.id} value={server.id}>{server.name}</option>
              ))}
            </select>
          </label>
          <label>
            Mapa
            <input value={form.map} onChange={(event) => setForm((current) => ({ ...current, map: event.target.value }))} />
          </label>
          <label>
            Slots
            <input type="number" value={form.totalPlayers} onChange={(event) => setForm((current) => ({ ...current, totalPlayers: Number(event.target.value) }))} />
          </label>
          <label>
            IP
            <input value={form.ipAddress} onChange={(event) => setForm((current) => ({ ...current, ipAddress: event.target.value }))} />
          </label>
          <button className="primary-button" type="submit">Guardar configuracao</button>
          {message ? <div className="form-success">{message}</div> : null}
        </form>
      </SectionCard>
    </div>
  );
}
