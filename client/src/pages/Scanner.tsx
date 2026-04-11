import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router";
import { Html5Qrcode } from "html5-qrcode";

const SCANNER_ID = "qr-scanner-container";

export default function Scanner() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = scanner;
    setScanning(true);

    scanner
      .start(
        { facingMode: "environment" }, // rear camera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // Stop scanning once we have a result
          scanner.stop().catch(console.error);

          // Extract path from the scanned URL
          try {
            const url = new URL(decodedText);
            // Navigate to the path component (e.g. /bins/abc-123)
            navigate(url.pathname);
          } catch {
            // If it's already just a path, navigate directly
            if (decodedText.startsWith("/bins/")) {
              navigate(decodedText);
            } else {
              setError(`Unrecognized QR code: ${decodedText}`);
              setScanning(false);
            }
          }
        },
        undefined // ignore per-frame errors
      )
      .catch((err: Error) => {
        setError(`Camera error: ${err.message}. Make sure camera permissions are granted.`);
        setScanning(false);
      });

    return () => {
      scanner.stop().catch(console.error);
    };
  }, [navigate]);

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 16px" }}>
      <Link to="/dashboard">← Back</Link>
      <h1>Scan QR Code</h1>
      <p style={{ color: "#666" }}>Point your camera at a bin QR code label.</p>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}

      {/* html5-qrcode renders into this div */}
      <div id={SCANNER_ID} style={{ width: "100%" }} />

      {!scanning && !error && <p>Initializing camera...</p>}
    </div>
  );
}
