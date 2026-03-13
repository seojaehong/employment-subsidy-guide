import { fetchOperationalProgram } from "../programs-lib.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const programId = req.query?.programId;
  if (!programId || typeof programId !== "string") {
    res.status(400).json({ message: "programId is required" });
    return;
  }

  const payload = await fetchOperationalProgram(programId);
  if (!payload.program) {
    res.status(404).json({ message: "Program not found" });
    return;
  }

  res.status(200).json(payload);
}
