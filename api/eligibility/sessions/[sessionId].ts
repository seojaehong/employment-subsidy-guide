import { getEligibilitySessionRecord } from "../../../server/eligibility-persistence.ts";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const sessionId = req.query?.sessionId;
  if (!sessionId || typeof sessionId !== "string") {
    res.status(400).json({ message: "sessionId is required" });
    return;
  }

  try {
    const payload = await getEligibilitySessionRecord(sessionId);
    if (!payload) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Eligibility session fetch failed",
    });
  }
}
