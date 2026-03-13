import { createOverride, readBody, requireAdminSession } from "../admin-lib.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
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
    const override = await createOverride({ ...body, authorEmail: session.email });
    res.status(201).json({ override });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "override 저장에 실패했습니다." });
  }
}
