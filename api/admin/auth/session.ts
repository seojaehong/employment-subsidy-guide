import { requireAdminSession } from "../../admin-lib.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const session = await requireAdminSession(req);
    res.status(200).json({ session });
  } catch (error) {
    res.status(401).json({ message: error instanceof Error ? error.message : "인증이 필요합니다." });
  }
}
