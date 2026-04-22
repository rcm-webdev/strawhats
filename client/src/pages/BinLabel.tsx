import { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { useParams, Link } from "react-router";
import { apiFetchJson } from "../lib/api";
import PrintLabel from "../components/PrintLabel";
import type { Bin } from "@strawhats/shared";

export default function BinLabel() {
  const { id } = useParams<{ id: string }>();
  const [bin, setBin] = useState<Bin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiFetchJson<Bin>(`/api/bins/${id}`)
      .then(setBin)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return null;
  if (error) return <p role="alert" style={{ color: "red" }}>{error}</p>;
  if (!bin) return <p>Bin not found.</p>;

  return (
    <>
      {/* Hide everything except .print-label when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-label, .print-label * { visibility: visible; }
          .print-label { position: fixed; top: 0; left: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print" style={{ maxWidth: 400, margin: "40px auto", padding: "0 16px" }}>
        <Link to={`/bins/${bin.id}`}>← Back to {bin.name}</Link>
        <h1>Print Label</h1>
        <p style={{ color: "#666" }}>
          Print this label and stick it on the physical box.
        </p>
        <button
          onClick={() => window.print()}
          style={{ marginBottom: 24, padding: "8px 16px" }}
        >
          <Printer size={16} style={{ display: "inline", verticalAlign: "middle" }} /> Print Label
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <PrintLabel bin={bin} appUrl={window.location.origin} />
      </div>
    </>
  );
}
