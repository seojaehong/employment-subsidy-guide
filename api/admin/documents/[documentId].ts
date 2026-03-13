import { getDocumentDetail, readBody, requireAdminSession, updateDocument } from "../../admin-lib.js";

export default async function handler(req: any, res: any) {
  const documentId = req.query.documentId as string;
  try {
    await requireAdminSession(req, "editor");
    if (req.method === "GET") {
      const detail = await getDocumentDetail(documentId);
      res.status(200).json(detail);
      return;
    }

    if (req.method === "PATCH") {
      const body = await readBody<{
        title?: string;
        issuer?: string;
        baseDate?: string;
        fileName?: string;
        status?: "draft" | "review" | "published";
      }>(req);
      const detail = await updateDocument(documentId, body);
      res.status(200).json(detail);
      return;
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "문서 조회에 실패했습니다." });
  }
}
