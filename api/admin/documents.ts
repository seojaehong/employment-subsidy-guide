import { createDocument, listDocuments, readBody, requireAdminSession } from "../admin-lib.js";

export default async function handler(req: any, res: any) {
  try {
    const session = await requireAdminSession(req, req.method === "POST" ? "editor" : "editor");
    if (req.method === "GET") {
      const payload = await listDocuments();
      res.status(200).json(payload);
      return;
    }

    if (req.method === "POST") {
      const body = await readBody<{
        title: string;
        issuer: string;
        baseDate: string;
        fileName: string;
        sourceDocumentId?: string;
      }>(req);
      const document = await createDocument({ ...body, createdByEmail: session.email });
      res.status(201).json(document);
      return;
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "문서 처리에 실패했습니다." });
  }
}
