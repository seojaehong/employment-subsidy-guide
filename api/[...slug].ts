import {
  createConsultationLead,
  createEligibilitySession,
  determineEligibilitySession,
  getEligibilityPayload,
  getEligibilitySession,
  getProgramByLegacyId,
  getRuleCoverage,
  listOperationalPrograms,
} from "../server/store";

function sendJson(res: any, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function readBody(req: any) {
  return new Promise<any>((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer | string) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req: any, res: any) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const pathname = url.pathname.replace(/\/+$/, "");

  try {
    if (req.method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, { ok: true, coverage: getRuleCoverage() });
      return;
    }

    if (req.method === "GET" && pathname === "/api/programs") {
      sendJson(res, 200, { programs: listOperationalPrograms() });
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/api/programs/")) {
      const programId = pathname.replace("/api/programs/", "");
      const program = getProgramByLegacyId(programId);
      if (!program) {
        sendJson(res, 404, { message: "Program not found" });
        return;
      }
      sendJson(res, 200, { program });
      return;
    }

    if (req.method === "GET" && pathname === "/api/eligibility/config") {
      sendJson(res, 200, getEligibilityPayload());
      return;
    }

    if (req.method === "POST" && pathname === "/api/eligibility/sessions") {
      const body = await readBody(req);
      sendJson(res, 201, createEligibilitySession(body));
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/api/eligibility/sessions/")) {
      const parts = pathname.split("/");
      if (parts.length === 5) {
        const payload = getEligibilitySession(parts[4]);
        if (!payload) {
          sendJson(res, 404, { message: "Session not found" });
          return;
        }
        sendJson(res, 200, payload);
        return;
      }
    }

    if (req.method === "POST" && pathname.endsWith("/determine")) {
      const parts = pathname.split("/");
      if (parts.length === 6 && parts[1] === "api" && parts[2] === "eligibility" && parts[3] === "sessions") {
        const body = await readBody(req);
        const payload = determineEligibilitySession(parts[4], body);
        if (!payload) {
          sendJson(res, 404, { message: "Session not found" });
          return;
        }
        sendJson(res, 200, payload);
        return;
      }
    }

    if (req.method === "POST" && pathname === "/api/consultation-leads") {
      const body = await readBody(req);
      sendJson(res, 201, { lead: createConsultationLead(body) });
      return;
    }

    sendJson(res, 404, { message: "Not found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    sendJson(res, 500, { message });
  }
}
