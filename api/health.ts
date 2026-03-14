import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const seedDb = require("../server/data/seed-db.json") as {
  subsidy_program: Array<{ published: boolean; category: string }>;
};

export default function handler(_req: any, res: any) {
  const publishedPrograms = seedDb.subsidy_program.filter((program) => program.published);
  res.status(200).json({
    ok: true,
    coverage: {
      programCount: publishedPrograms.length,
      categoryCount: new Set(publishedPrograms.map((program) => program.category)).size,
    },
  });
}
