import { useEffect, useState } from "react";
import SectionCard from "../components/SectionCard";
import { useApp } from "../context/AppContext";

export default function AdminPage() {
  const { apiUrl } = useApp();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${apiUrl}/api/users`)
      .then((response) => response.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [apiUrl]);

  return (
    <div className="page-grid">
      <SectionCard title="Contas de acesso" subtitle="Admin">
        <div className="admin-list">
          {users.map((user) => (
            <article className="admin-card" key={user.id}>
              <strong>{user.username}</strong>
              <span>{user.role}</span>
              <small>{user.email}</small>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
