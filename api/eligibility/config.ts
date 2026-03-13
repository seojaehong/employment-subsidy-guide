import { getEligibilityConfig } from "../../shared/subsidy.ts";
import { getEligibilityQuestions } from "../../server/eligibility-persistence.ts";

export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  res.status(200).json({
    config: getEligibilityConfig(),
    questions: getEligibilityQuestions(),
  });
}
