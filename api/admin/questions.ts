import type { QuestionSetVersion } from "../../shared/subsidy";
import { readBody, replaceQuestionSets, requireAdminSession } from "../admin-lib.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "PUT") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    await requireAdminSession(req, "editor");
    const body = await readBody<{ documentId: string; questionSets: QuestionSetVersion[] }>(req);
    const detail = await replaceQuestionSets(body.documentId, body.questionSets);
    res.status(200).json(detail);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "질문 저장에 실패했습니다." });
  }
}
