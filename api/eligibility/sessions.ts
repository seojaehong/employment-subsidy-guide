import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const seedDb = require("../../../server/data/seed-db.json") as {
  subsidy_program: Array<{
    legacyId: string;
    published: boolean;
    name: string;
    category: string;
    amountLabel: string;
    summary: string;
    duration: string;
    applicationCycle: string;
    latestSourceDocumentId: string;
    sourceDocumentIds: string[];
    tags: string[];
    baseAmount: Record<string, string>;
    publishedAt?: string;
    highlight?: boolean;
  }>;
  subsidy_rule: Array<{ programId: string; requirements: string[]; exclusions: string[]; notes: string[]; followUpQuestionIds: string[] }>;
  subsidy_exclusion: Array<{ id: string; programId: string; text: string }>;
  subsidy_source_document: Array<{ id: string; title: string; issuer: string; 기준일: string; publishedAt: string; fileName: string; priority: number }>;
};

function readBody(req: any) {
  return new Promise<any>((resolve, reject) => {
    if (req.body && typeof req.body === "object") {
      resolve(req.body as BaseEligibilityAnswers);
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

function getOperationalProgram(programId: string) {
  const program = seedDb.subsidy_program.find((item) => item.legacyId === programId && item.published);
  if (!program) return null;
  const rule = seedDb.subsidy_rule.find((item) => item.programId === programId);
  const latestSource =
    seedDb.subsidy_source_document.find((item) => item.id === program.latestSourceDocumentId) ??
    seedDb.subsidy_source_document[0];

  if (!rule) return null;

  return {
    program,
    rule,
    exclusions: seedDb.subsidy_exclusion.filter((item) => item.programId === programId),
    latestSource,
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const baseAnswers = await readBody(req);
    const [{ createEligibilitySessionRecord }] = await Promise.all([
      import("../../server/eligibility-persistence.ts"),
    ]);
    const payload = await createEligibilitySessionRecord(baseAnswers);

    res.status(201).json({
      session: {
        id: payload.session.id,
        createdAt: payload.session.createdAt,
        baseAnswers: payload.session.baseAnswers,
        recommendations: payload.session.recommendations,
      },
      recommendedPrograms: payload.session.recommendations.map((recommendation: any) => ({
        ...recommendation,
        program: getOperationalProgram(recommendation.programId),
      })),
      followUpQuestions: payload.followUpQuestions,
      storage: payload.storage,
    });
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Eligibility session creation failed",
    });
  }
}
