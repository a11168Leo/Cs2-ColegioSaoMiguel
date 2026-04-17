import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, authError } = useApp();
  const [form, setForm] = useState({ username: "", password: "" });
  const [pending, setPending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    const ok = await login(form);
    setPending(false);
    if (ok) navigate("/");
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <p className="eyebrow">Node.js + React</p>
        <h1>Uma base mais fluida para gerir CS2</h1>
        <p className="login-copy">
          Entradas demo: manager / manager123, admin / admin123, arbitro / arbitro123.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Utilizador
            <input
              type="text"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="manager"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="manager123"
            />
          </label>
          {authError ? <div className="form-error">{authError}</div> : null}
          <button className="primary-button" type="submit" disabled={pending}>
            {pending ? "A entrar..." : "Entrar no painel"}
          </button>
        </form>
      </div>
    </div>
  );
}
