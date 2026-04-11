import { useState, useEffect, FormEvent } from "react";
import { useParams, Link } from "react-router";
import { apiFetch, apiFetchJson } from "../lib/api";
import type { Bin, Item } from "@strawhats/shared";

export default function BinDetail() {
  const { id } = useParams<{ id: string }>();
  const [bin, setBin] = useState<Bin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetchJson<Bin>(`/api/bins/${id}`)
      .then(setBin)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddItem(e: FormEvent) {
    e.preventDefault();
    if (!id || !newItemName.trim()) return;
    setAddingItem(true);

    try {
      const item = await apiFetchJson<Item>(`/api/bins/${id}/items`, {
        method: "POST",
        body: JSON.stringify({ name: newItemName.trim(), description: newItemDesc || undefined }),
      });
      setBin((prev) => prev ? { ...prev, items: [...(prev.items ?? []), item] } : prev);
      setNewItemName("");
      setNewItemDesc("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAddingItem(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    await apiFetch(`/api/items/${itemId}`, { method: "DELETE" });
    setBin((prev) =>
      prev ? { ...prev, items: (prev.items ?? []).filter((i) => i.id !== itemId) } : prev
    );
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p role="alert" style={{ color: "red" }}>{error}</p>;
  if (!bin) return <p>Bin not found.</p>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px" }}>
      <Link to="/dashboard">← Back</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>{bin.name}</h1>
          <p>📍 {bin.location}</p>
          {bin.description && <p>{bin.description}</p>}
        </div>
        <div>
          <Link to={`/bins/${bin.id}/edit`}>Edit Bin</Link>
          {" | "}
          <Link to={`/bins/${bin.id}/label`}>Print Label</Link>
        </div>
      </div>

      {/* QR code rendered here in Plan 4 */}
      <div id="qr-placeholder" style={{ margin: "16px 0", color: "#999" }}>
        QR code — coming in Plan 4
      </div>

      <h2>Items ({bin.items?.length ?? 0})</h2>
      <ul>
        {(bin.items ?? []).map((item) => (
          <li key={item.id}>
            <strong>{item.name}</strong>
            {item.description && ` — ${item.description}`}
            {" "}
            <button onClick={() => handleDeleteItem(item.id)}>✕</button>
          </li>
        ))}
      </ul>

      <h3>Add Item</h3>
      <form onSubmit={handleAddItem} style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          placeholder="Item name"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newItemDesc}
          onChange={(e) => setNewItemDesc(e.target.value)}
        />
        <button type="submit" disabled={addingItem}>
          {addingItem ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
}
