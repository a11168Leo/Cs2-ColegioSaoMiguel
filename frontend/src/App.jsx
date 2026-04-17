import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import AppShell from "./components/AppShell";
import DashboardPage from "./pages/DashboardPage";
import ServersPage from "./pages/ServersPage";
import TeamsPage from "./pages/TeamsPage";
import MatchesPage from "./pages/MatchesPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route
          path="/*"
          element={
            <AppShell>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/servers" element={<ServersPage />} />
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/matches" element={<MatchesPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </AppShell>
          }
        />
      </Routes>
    </AppProvider>
  );
}
