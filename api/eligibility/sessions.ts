import { createEligibilitySessionRecord } from "./lib.ts";

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

  try {
    const baseAnswers = await readBody(req);
    const payload = await createEligibilitySessionRecord(baseAnswers);

    res.status(201).json({
      session: {
        id: payload.session.id,
        createdAt: payload.session.createdAt,
        baseAnswers: payload.session.baseAnswers,
        recommendations: payload.session.recommendations,
      },
      followUpQuestions: payload.followUpQuestions,
      storage: payload.storage,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Eligibility session creation failed",
    });
  }
}
