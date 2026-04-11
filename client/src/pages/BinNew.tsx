import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { apiFetchJson } from "../lib/api";
import type { Bin } from "@strawhats/shared";

export default function BinNew() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const bin = await apiFetchJson<Bin>("/api/bins", {
        method: "POST",
        body: JSON.stringify({ name, location, description: description || undefined }),
      });
      navigate(`/bins/${bin.id}`);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 16px" }}>
      <Link to="/dashboard">← Back</Link>
      <h1>New Bin</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Bin Name *</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Hot Wheels Box 1"
          />
        </div>
        <div>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Storage Unit, Garage, House"
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Bin"}
        </button>
      </form>
    </div>
  );
}
