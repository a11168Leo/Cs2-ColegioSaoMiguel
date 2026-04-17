import { createContext, useContext, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:3333";
const SESSION_KEY = "cs2csm.session";
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  async function fetchBootstrap() {
    const response = await fetch(`${API_URL}/api/bootstrap`);
    const data = await response.json();
    setDashboard(data);
    return data;
  }

  useEffect(() => {
    fetchBootstrap()
      .catch(() => setDashboard(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    setAuthError("");
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Falha no login." }));
      setAuthError(error.message);
      return false;
    }

    const data = await response.json();
    setSession(data.user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
    return true;
  }

  function logout() {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  }

  async function updateServerConfig(payload) {
    const response = await fetch(`${API_URL}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    await fetchBootstrap();
    return data;
  }

  async function runCommand(action) {
    const response = await fetch(`${API_URL}/api/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const data = await response.json();
    await fetchBootstrap();
    return data;
  }

  const value = useMemo(
    () => ({
      apiUrl: API_URL,
      session,
      dashboard,
      loading,
      authError,
      login,
      logout,
      fetchBootstrap,
      updateServerConfig,
      runCommand
    }),
    [session, dashboard, loading, authError]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
