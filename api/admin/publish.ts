import { publishDocument, readBody, requireAdminSession } from "../admin-lib.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const session = await requireAdminSession(req, "publisher");
    const body = await readBody<{ documentId: string }>(req);
    const detail = await publishDocument(body.documentId, session.email);
    res.status(200).json(detail);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "게시 처리에 실패했습니다." });
  }
}
