import { fetchOperationalPrograms } from "../server/api/programs-lib.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const payload = await fetchOperationalPrograms();
  res.status(200).json(payload);
}
