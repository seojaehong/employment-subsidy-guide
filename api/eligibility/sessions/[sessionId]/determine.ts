import { determineEligibilitySessionRecord } from "../../lib.js";

function readBody(req: any) {
  return new Promise<any>((resolve, reject) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body);
      return;
    }

    let body = "";
    req.on("data", (chunk: Buffer | string) => {
      body += chunk.toString();
    });
    req.on("end", () => {
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
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const sessionId = req.query?.sessionId;
  if (!sessionId || typeof sessionId !== "string") {
    res.status(400).json({ message: "sessionId is required" });
    return;
  }

  try {
    const followUpAnswers = await readBody(req);
    const payload = await determineEligibilitySessionRecord(sessionId, followUpAnswers);
    if (!payload) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Eligibility determination failed",
    });
  }
}
