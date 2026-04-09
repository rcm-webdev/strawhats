import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();
const PORT = process.env.PORT ?? 3001;

// Better Auth handles its own body parsing — mount BEFORE express.json()
app.all("/api/auth/*", toNodeHandler(auth));

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// TODO: mount routes here in Plan 2
// app.use("/api/bins", binsRouter);
// app.use("/api/items", itemsRouter);
// app.use("/api/search", searchRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}. You better catch it!`);
});

export { app };
