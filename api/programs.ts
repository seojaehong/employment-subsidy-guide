import { createRequire } from "node:module";
import type {
  OperationalProgram,
  SourceDocumentRecord,
  SubsidyExclusionRecord,
  SubsidyProgramRecord,
  SubsidyRuleRecord,
} from "../shared/subsidy";

const require = createRequire(import.meta.url);
const seedDb = require("../server/data/seed-db.json") as {
  subsidy_program: SubsidyProgramRecord[];
  subsidy_rule: SubsidyRuleRecord[];
  subsidy_exclusion: SubsidyExclusionRecord[];
  subsidy_source_document: SourceDocumentRecord[];
};

const programs: OperationalProgram[] = seedDb.subsidy_program
  .filter((program) => program.published)
  .map((program) => ({
    program,
    rule: seedDb.subsidy_rule.find((rule) => rule.programId === program.legacyId)!,
    exclusions: seedDb.subsidy_exclusion.filter((entry) => entry.programId === program.legacyId),
    latestSource:
      seedDb.subsidy_source_document.find((source) => source.id === program.latestSourceDocumentId) ??
      seedDb.subsidy_source_document[0],
  }));

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  res.status(200).json({ programs });
}
