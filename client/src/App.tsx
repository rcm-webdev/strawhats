import { Routes, Route } from "react-router";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<div>Login — coming in Plan 3</div>} />
      <Route path="/register" element={<div>Register — coming in Plan 3</div>} />
      <Route path="/dashboard" element={<div>Dashboard — coming in Plan 3</div>} />
      <Route path="/" element={<div>Strawhats Bin Organizer</div>} />
    </Routes>
  );
}
