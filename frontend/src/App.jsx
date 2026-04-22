import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const API_PREFIX = import.meta.env.VITE_API_PREFIX ?? "/api";
const TOKEN_STORAGE_KEY = "panel-token";

const initialForm = {
  token: "",
};

function buildDashboardUrl() {
  return `${API_BASE_URL}${API_PREFIX}/dashboard`;
}

async function fetchDashboard(token) {
  const response = await fetch(buildDashboardUrl(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMessage = "Nao foi possivel validar o token.";

    try {
      const payload = await response.json();
      if (payload?.detail) {
        errorMessage = payload.detail;
      }
    } catch {
      errorMessage = response.status === 401
        ? "Token invalido."
        : "Erro inesperado ao comunicar com o backend.";
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

function App() {
  const [form, setForm] = useState(initialForm);
  const [token, setToken] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!savedToken) {
      return;
    }

    setForm({ token: savedToken });
    handleLogin(savedToken);
  }, []);

  async function handleLogin(rawToken) {
    const nextToken = rawToken.trim();
    if (!nextToken) {
      setError("Informe o token de acesso.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const data = await fetchDashboard(nextToken);
      window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      setToken(nextToken);
      setDashboard(data);
      setStatus("authenticated");
    } catch (requestError) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken("");
      setDashboard(null);
      setStatus("error");
      setError(requestError.message);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleLogin(form.token);
  }

  function handleLogout() {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setForm(initialForm);
    setToken("");
    setDashboard(null);
    setError("");
    setStatus("idle");
  }

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && dashboard;

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">CS2 Colegio Sao Miguel</span>
          <h1>Painel de controlo com acesso protegido.</h1>
          <p>
            Esta primeira etapa prepara o frontend com uma entrada de login
            simples, pronta para receber os proximos modulos do painel.
          </p>
          <div className="hero__meta">
            <div>
              <strong>API</strong>
              <span>{API_BASE_URL}{API_PREFIX}</span>
            </div>
            <div>
              <strong>Sessao</strong>
              <span>{isAuthenticated ? "Ligada" : "A aguardar login"}</span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card__header">
            <span className="login-card__badge">Login</span>
            <h2>Entrar no painel</h2>
            <p>Usa o bearer token configurado no backend para aceder.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Token de acesso</span>
              <input
                type="password"
                value={form.token}
                onChange={(event) =>
                  setForm({ token: event.target.value })
                }
                placeholder="Bearer token"
                autoComplete="current-password"
              />
            </label>

            {error ? <p className="form-message form-message--error">{error}</p> : null}

            <button type="submit" disabled={isLoading}>
              {isLoading ? "A validar..." : "Entrar"}
            </button>
          </form>

          <div className="login-card__footer">
            <span>Backend esperado em</span>
            <code>{buildDashboardUrl()}</code>
          </div>
        </div>
      </section>

      <section className="status-panel">
        <div className="status-panel__header">
          <div>
            <span className="eyebrow">Estado atual</span>
            <h3>Base pronta para os proximos passos</h3>
          </div>

          {isAuthenticated ? (
            <button className="secondary-button" type="button" onClick={handleLogout}>
              Sair
            </button>
          ) : null}
        </div>

        {isAuthenticated ? (
          <div className="status-grid">
            <article className="info-card">
              <span>Aplicacao</span>
              <strong>{dashboard.app_name}</strong>
            </article>
            <article className="info-card">
              <span>Servidor</span>
              <strong>{dashboard.server_name}</strong>
            </article>
            <article className="info-card">
              <span>Endereco</span>
              <strong>{dashboard.server_address}</strong>
            </article>
            <article className="info-card">
              <span>Modo</span>
              <strong>{dashboard.simulation_mode ? "Simulacao" : "Produção"}</strong>
            </article>
            <article className="info-card info-card--wide">
              <span>Match ativa</span>
              <strong>
                {dashboard.active_match
                  ? dashboard.active_match.title
                  : "Nenhuma match ativa neste momento"}
              </strong>
            </article>
            <article className="info-card info-card--wide">
              <span>Fila</span>
              <strong>{dashboard.queued_matches.length} match(es) em espera</strong>
            </article>
          </div>
        ) : (
          <div className="empty-state">
            <p>
              Depois do login, este espaco pode receber dashboard, gestao de partidas
              e os proximos fluxos que tu fores mandando.
            </p>
            <small>
              Token guardado localmente em <code>{TOKEN_STORAGE_KEY}</code>.
            </small>
          </div>
        )}

        {token ? (
          <p className="token-hint">
            Sessao guardada localmente e pronta para reutilizacao nas proximas telas.
          </p>
        ) : null}
      </section>
    </main>
  );
}

export default App;
