import { subsidyData } from "../client/src/lib/subsidyData";

export default function handler(_req: any, res: any) {
  res.status(200).json({
    ok: true,
    coverage: {
      programCount: subsidyData.length,
      categoryCount: new Set(subsidyData.map((item) => item.category)).size,
    },
  });
}
