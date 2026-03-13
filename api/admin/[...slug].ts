import type { ProgramDraftRecord, QuestionSetVersion, RuleDefinition } from "../../shared/subsidy";
import {
  bootstrapAdmin,
  createDocument,
  createOverride,
  getDocumentDetail,
  listDocuments,
  loginAdmin,
  publishDocument,
  readBody,
  replaceProgramDrafts,
  replaceQuestionSets,
  replaceRuleDefinitions,
  requireAdminSession,
  updateDocument,
} from "../../server/api/admin-lib.js";

function getSegments(req: any) {
  const raw = req.query.slug;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return [raw];
  return [];
}

export default async function handler(req: any, res: any) {
  const segments = getSegments(req);

  try {
    if (segments.length === 2 && segments[0] === "auth" && segments[1] === "login") {
      if (req.method !== "POST") {
        res.status(405).json({ message: "Method not allowed" });
        return;
      }
      const body = await readBody<{ email: string; password: string }>(req);
      res.status(200).json({ session: await loginAdmin(body.email, body.password) });
      return;
    }

    if (segments.length === 2 && segments[0] === "auth" && segments[1] === "bootstrap") {
      if (req.method !== "POST") {
        res.status(405).json({ message: "Method not allowed" });
        return;
      }
      const body = await readBody<{ email: string; password: string }>(req);
      res.status(201).json({ session: await bootstrapAdmin(body.email, body.password) });
      return;
    }

    if (segments.length === 2 && segments[0] === "auth" && segments[1] === "session") {
      if (req.method !== "GET") {
        res.status(405).json({ message: "Method not allowed" });
        return;
      }
      res.status(200).json({ session: await requireAdminSession(req) });
      return;
    }

    if (segments.length === 1 && segments[0] === "documents") {
      const session = await requireAdminSession(req, "editor");
      if (req.method === "GET") {
        res.status(200).json(await listDocuments());
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
        res.status(201).json(await createDocument({ ...body, createdByEmail: session.email }));
        return;
      }
      res.status(405).json({ message: "Method not allowed" });
      return;
    }

    if (segments.length === 2 && segments[0] === "documents") {
      await requireAdminSession(req, "editor");
      const documentId = segments[1];
      if (req.method === "GET") {
        res.status(200).json(await getDocumentDetail(documentId));
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
        res.status(200).json(await updateDocument(documentId, body));
        return;
      }
      res.status(405).json({ message: "Method not allowed" });
      return;
    }

    if (segments.length === 1 && segments[0] === "program-drafts") {
      if (req.method !== "PUT") {
        res.status(405).json({ message: "Method not allowed" });
        return;
      }
      await requireAdminSession(req, "editor");
      const body = await readBody<{ documentId: string; drafts: ProgramDraftRecord[] }>(req);
      res.status(200).json(await replaceProgramDrafts(body.documentId, body.drafts));
      return;
    }

    if (segments.length === 1 && segments[0] === "questions") {
      if (req.method !== "PUT") {
        res.status(405).json({ message: "Method not allowed" });
        return;
      }
      await requireAdminSession(req, "editor");
      const body = await readBody<{ documentId: string; questionSets: QuestionSetVersion[] }>(req);
      res.status(200).json(await replaceQuestionSets(body.documentId, body.questionSets));
      return;
    }

    if (segments.length === 1 && segments[0] === "rules") {
      if (req.method !== "PUT") {
        res.status(405).json({ message: "Method not allowed" });
        return;
      }
      await requireAdminSession(req, "editor");
      const body = await readBody<{ documentId: string; rules: RuleDefinition[] }>(req);
      res.status(200).json(await replaceRuleDefinitions(body.documentId, body.rules));
      return;
    }

    if (segments.length === 1 && segments[0] === "overrides") {
      if (req.method !== "POST") {
        res.status(405).json({ message: "Method not allowed" });
        return;
      }
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
      res.status(201).json({ override: await createOverride({ ...body, authorEmail: session.email }) });
      return;
    }

    if (segments.length === 1 && segments[0] === "publish") {
      if (req.method !== "POST") {
        res.status(405).json({ message: "Method not allowed" });
        return;
      }
      const session = await requireAdminSession(req, "publisher");
      const body = await readBody<{ documentId: string }>(req);
      res.status(200).json(await publishDocument(body.documentId, session.email));
      return;
    }

    res.status(404).json({ message: "Not found" });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "관리자 요청 처리에 실패했습니다." });
  }
}
