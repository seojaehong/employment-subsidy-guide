export default function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }
  Promise.all([
    import("../../shared/subsidy.ts"),
    import("../../server/eligibility-persistence.ts"),
  ])
    .then(([subsidyModule, persistenceModule]) => {
      res.status(200).json({
        config: subsidyModule.getEligibilityConfig(),
        questions: persistenceModule.getEligibilityQuestions(),
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Eligibility config load failed",
      });
    });
}
