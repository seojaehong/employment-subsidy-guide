import { getEligibilityRuntimeConfig } from "./lib.js";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    res.status(200).json(getEligibilityRuntimeConfig());
  } catch (error) {
    res.status(500).json({
      message: error instanceof Error ? error.message : "Eligibility config load failed",
    });
  }
}
