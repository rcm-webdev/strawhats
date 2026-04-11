import { useState, useEffect } from "react";
import { Link } from "react-router";
import { authClient } from "../lib/auth-client";
import type { User } from "@strawhats/shared";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authClient.admin
      .listUsers({ query: { limit: 100 } })
      .then((result) => {
        if (result.error) throw new Error(result.error.message);
        setUsers((result.data?.users ?? []) as unknown as User[]);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 16px" }}>
      <Link to="/dashboard">← Back</Link>
      <h1>User Management</h1>

      {loading && <p>Loading users...</p>}
      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #ccc" }}>Email</th>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #ccc" }}>Name</th>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #ccc" }}>Role</th>
            <th style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #ccc" }}>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{user.email}</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{user.name}</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{user.role}</td>
              <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
