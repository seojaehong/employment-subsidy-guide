import { bootstrapAdmin, readBody } from "../../admin-lib.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const body = await readBody<{ email: string; password: string }>(req);
    const session = await bootstrapAdmin(body.email, body.password);
    res.status(201).json({ session });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "관리자 초기 설정에 실패했습니다." });
  }
}
