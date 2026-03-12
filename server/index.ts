import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import {
  createConsultationLead,
  createEligibilitySession,
  determineEligibilitySession,
  getEligibilityPayload,
  getEligibilitySession,
  getProgramByLegacyId,
  getRuleCoverage,
  listOperationalPrograms,
} from "./store";
import type { BaseEligibilityAnswers, FollowUpAnswers } from "@shared/subsidy";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.use(express.json());

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, coverage: getRuleCoverage() });
  });

  app.get("/api/programs", (_req, res) => {
    res.json({
      programs: listOperationalPrograms(),
    });
  });

  app.get("/api/programs/:id", (req, res) => {
    const program = getProgramByLegacyId(req.params.id);
    if (!program) {
      res.status(404).json({ message: "Program not found" });
      return;
    }

    res.json({ program });
  });

  app.get("/api/eligibility/config", (_req, res) => {
    res.json(getEligibilityPayload());
  });

  app.post("/api/eligibility/sessions", (req, res) => {
    const baseAnswers = req.body as BaseEligibilityAnswers;
    const payload = createEligibilitySession(baseAnswers);
    res.status(201).json(payload);
  });

  app.get("/api/eligibility/sessions/:id", (req, res) => {
    const payload = getEligibilitySession(req.params.id);
    if (!payload) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    res.json(payload);
  });

  app.post("/api/eligibility/sessions/:id/determine", (req, res) => {
    const payload = determineEligibilitySession(req.params.id, req.body as FollowUpAnswers);
    if (!payload) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    res.json(payload);
  });

  app.post("/api/consultation-leads", (req, res) => {
    const lead = createConsultationLead(req.body);
    res.status(201).json({ lead });
  });

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
