import type { ProgramDraftRecord, QuestionSetVersion, RuleDefinition } from "../shared/subsidy";
import {
  bootstrapAdmin,
  createDocument,
  createOverride,
  getDocumentDetail,
  listConsultationLeads,
  listDocuments,
  loginAdmin,
  publishDocument,
  readBody,
  replaceProgramDrafts,
  replaceQuestionSets,
  replaceRuleDefinitions,
  requireAdminSession,
  updateDocument,
} from "../server/api/admin-lib.js";

function getAction(req: any) {
  return typeof req.query?.action === "string" ? req.query.action : "";
}

export default async function handler(req: any, res: any) {
  const action = getAction(req);

  try {
    if (action === "login") {
      if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
      const body = await readBody<{ email: string; password: string }>(req);
      return res.status(200).json({ session: await loginAdmin(body.email, body.password) });
    }

    if (action === "bootstrap") {
      if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
      const body = await readBody<{ email: string; password: string }>(req);
      return res.status(201).json({ session: await bootstrapAdmin(body.email, body.password) });
    }

    if (action === "session") {
      if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
      return res.status(200).json({ session: await requireAdminSession(req) });
    }

    if (action === "documents") {
      const session = await requireAdminSession(req, "editor");
      if (req.method === "GET") return res.status(200).json(await listDocuments());
      if (req.method === "POST") {
        const body = await readBody<{
          title: string;
          issuer: string;
          baseDate: string;
          fileName: string;
          sourceDocumentId?: string;
        }>(req);
        return res.status(201).json(await createDocument({ ...body, createdByEmail: session.email }));
      }
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (action === "leads") {
      await requireAdminSession(req, "editor");
      if (req.method === "GET") return res.status(200).json(await listConsultationLeads());
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (action === "document") {
      const documentId = req.query?.documentId;
      if (!documentId || typeof documentId !== "string") {
        return res.status(400).json({ message: "documentId is required" });
      }
      await requireAdminSession(req, "editor");
      if (req.method === "GET") return res.status(200).json(await getDocumentDetail(documentId));
      if (req.method === "PATCH") {
        const body = await readBody<{
          title?: string;
          issuer?: string;
          baseDate?: string;
          fileName?: string;
          status?: "draft" | "review" | "published";
        }>(req);
        return res.status(200).json(await updateDocument(documentId, body));
      }
      return res.status(405).json({ message: "Method not allowed" });
    }

    if (action === "program-drafts") {
      if (req.method !== "PUT") return res.status(405).json({ message: "Method not allowed" });
      await requireAdminSession(req, "editor");
      const body = await readBody<{ documentId: string; drafts: ProgramDraftRecord[] }>(req);
      return res.status(200).json(await replaceProgramDrafts(body.documentId, body.drafts));
    }

    if (action === "questions") {
      if (req.method !== "PUT") return res.status(405).json({ message: "Method not allowed" });
      await requireAdminSession(req, "editor");
      const body = await readBody<{ documentId: string; questionSets: QuestionSetVersion[] }>(req);
      return res.status(200).json(await replaceQuestionSets(body.documentId, body.questionSets));
    }

    if (action === "rules") {
      if (req.method !== "PUT") return res.status(405).json({ message: "Method not allowed" });
      await requireAdminSession(req, "editor");
      const body = await readBody<{ documentId: string; rules: RuleDefinition[] }>(req);
      return res.status(200).json(await replaceRuleDefinitions(body.documentId, body.rules));
    }

    if (action === "overrides") {
      if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
      const session = await requireAdminSession(req, "editor");
      const body = await readBody<{
        documentVersionId?: string | null;
        targetType: string;
        targetId: string;
        fieldName: string;
        value: string;
        reason: string;
        effectiveFrom: string;
      }>(req);
      return res.status(201).json({ override: await createOverride({ ...body, authorEmail: session.email }) });
    }

    if (action === "publish") {
      if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
      const session = await requireAdminSession(req, "publisher");
      const body = await readBody<{ documentId: string }>(req);
      return res.status(200).json(await publishDocument(body.documentId, session.email));
    }

    res.status(404).json({ message: "Not found" });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "관리자 요청 처리에 실패했습니다." });
  }
}
