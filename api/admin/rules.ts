import type { RuleDefinition } from "../../shared/subsidy";
import { readBody, replaceRuleDefinitions, requireAdminSession } from "../admin-lib.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "PUT") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    await requireAdminSession(req, "editor");
    const body = await readBody<{ documentId: string; rules: RuleDefinition[] }>(req);
    const detail = await replaceRuleDefinitions(body.documentId, body.rules);
    res.status(200).json(detail);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "규칙 저장에 실패했습니다." });
  }
}
