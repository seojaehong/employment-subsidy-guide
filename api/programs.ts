import type { OperationalProgram } from "../shared/subsidy";
import { subsidyData } from "../client/src/lib/subsidyData";

function buildPrograms(): OperationalProgram[] {
  return subsidyData.map((item) => ({
    program: {
      id: `api-${item.id}`,
      legacyId: item.id,
      name: item.name,
      subName: item.subName,
      category: item.category,
      summary: item.description,
      amountLabel: item.amountLabel,
      duration: item.duration,
      applicationCycle: item.applicationCycle,
      tags: item.tags,
      highlight: item.highlight,
      baseAmount: item.amount,
      sourceDocumentIds: ["api-fallback-doc"],
      latestSourceDocumentId: "api-fallback-doc",
      published: true,
    },
    rule: {
      id: `api-rule-${item.id}`,
      programId: item.id,
      requirements: item.requirements,
      exclusions: item.exclusions,
      notes: item.notes,
      followUpQuestionIds: [],
    },
    exclusions: item.exclusions.map((text, index) => ({
      id: `api-exclusion-${item.id}-${index + 1}`,
      programId: item.id,
      text,
    })),
    latestSource: {
      id: "api-fallback-doc",
      title: "2026 고용장려금 운영 데이터",
      issuer: "노무법인 위너스",
      기준일: "2026-01-01",
      publishedAt: "2026-01-01",
      fileName: "client/src/lib/subsidyData.ts",
      priority: 0,
    },
  }));
}

const programs = buildPrograms();

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  res.status(200).json({ programs });
}
