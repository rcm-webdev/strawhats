import { useState, useEffect } from "react";
import { Link } from "react-router";
import { apiFetchJson } from "../lib/api";
import { signOut } from "../lib/auth-client";
import BinCard from "../components/BinCard";
import { Skeleton } from "../components/ui/skeleton";
import type { Bin } from "@strawhats/shared";

export default function Dashboard() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);

    apiFetchJson<Bin[]>(`/api/bins?${params.toString()}`)
      .then(setBins)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [location]);

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  const locations = [...new Set(bins.map((b) => b.location))].sort();

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 16,
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Bins</h1>
        <div>
          <Link to="/scan">📷 Scan</Link>
          {" | "}
          <Link to="/bins/new">+ New Bin</Link>
          {" | "}
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && search.trim()) {
              window.location.href = `/search?q=${encodeURIComponent(search.trim())}`;
            }
          }}
        />
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      <div style={gridStyle}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
                <Skeleton style={{ height: 20, width: "75%", marginBottom: 8 }} />
                <Skeleton style={{ height: 16, width: "50%", marginBottom: 8 }} />
                <Skeleton style={{ height: 14, width: "100%", marginBottom: 8 }} />
                <Skeleton style={{ height: 14, width: "30%" }} />
              </div>
            ))
          : bins.length === 0
            ? <p>No bins yet. <Link to="/bins/new">Create your first bin.</Link></p>
            : bins.map((bin) => <BinCard key={bin.id} bin={bin} />)
        }
      </div>
    </div>
  );
}
