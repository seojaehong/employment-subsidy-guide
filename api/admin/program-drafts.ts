import type { ProgramDraftRecord } from "../../shared/subsidy";
import { readBody, replaceProgramDrafts, requireAdminSession } from "../admin-lib.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "PUT") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    await requireAdminSession(req, "editor");
    const body = await readBody<{ documentId: string; drafts: ProgramDraftRecord[] }>(req);
    const detail = await replaceProgramDrafts(body.documentId, body.drafts);
    res.status(200).json(detail);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "초안 저장에 실패했습니다." });
  }
}
