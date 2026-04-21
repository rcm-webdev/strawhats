import { useState, useEffect, useCallback } from "react";
import { apiFetchJson } from "../lib/api";
import { signOut, useSession } from "../lib/auth-client";
import DeleteUserModal from "../components/DeleteUserModal";
import type { AdminUser } from "@strawhats/shared";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadUsers = useCallback(() => {
    setLoading(true);
    apiFetchJson<AdminUser[]>("/api/admin/users")
      .then(setUsers)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  async function handleToggleBan(user: AdminUser) {
    setActionError(null);
    const action = user.banned ? "unban" : "ban";
    try {
      await apiFetchJson<void>(`/api/admin/users/${user.id}/${action}`, {
        method: "POST",
      });
      loadUsers();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    }
  }

  async function handleDelete(user: AdminUser) {
    await apiFetchJson<void>(`/api/admin/users/${user.id}`, { method: "DELETE" });
    setPendingDelete(null);
    loadUsers();
  }

  const isSelf = (user: AdminUser) => user.id === session?.user?.id;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>User Management</h1>
        <button onClick={handleSignOut}>Sign Out</button>
      </header>

      {loading && <p>Loading users…</p>}
      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
      {actionError && <p role="alert" style={{ color: "red" }}>{actionError}</p>}

      {!loading && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Email", "Name", "Role", "Status", "Joined", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #ccc" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ opacity: isSelf(user) ? 0.6 : 1 }}>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{user.email}</td>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{user.name}</td>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{user.role ?? "user"}</td>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                  {user.banned ? "Deactivated" : "Active"}
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                  <button
                    onClick={() => handleToggleBan(user)}
                    disabled={isSelf(user)}
                    style={{ marginRight: 8 }}
                  >
                    {user.banned ? "Reactivate" : "Deactivate"}
                  </button>
                  <button
                    onClick={() => {
                      setActionError(null);
                      setPendingDelete(user);
                    }}
                    disabled={isSelf(user)}
                    style={{ color: "#dc2626" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pendingDelete && (
        <DeleteUserModal
          user={pendingDelete}
          onConfirm={() => handleDelete(pendingDelete)}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
