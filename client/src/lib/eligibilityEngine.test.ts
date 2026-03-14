import { describe, expect, it } from "vitest";
import { determineProgram, recommendProgramIds, type BaseEligibilityAnswers } from "@shared/subsidy";

describe("eligibility engine", () => {
  it("recommends regular conversion for 30인 미만 conversion case", () => {
    const baseAnswers: BaseEligibilityAnswers = {
      companySize: "우선지원대상기업",
      workforceRange: "5to29",
      locationType: "metropolitan",
      situations: ["regularConversion"],
    };

    const recommendations = recommendProgramIds(baseAnswers);
    expect(recommendations[0]?.programId).toBe("regular-conversion");
  });

  it("marks regular conversion ineligible for 30인 이상", () => {
    const result = determineProgram(
      "regular-conversion",
      {
        companySize: "우선지원대상기업",
        workforceRange: "30to99",
        locationType: "metropolitan",
        situations: ["regularConversion"],
      },
      {
        "regular-conversion.tenureSixMonths": "yes",
        "regular-conversion.formalConversion": "yes",
        "regular-conversion.maintainOneMonth": "yes",
        "regular-conversion.wageIncrease": "yes",
      },
    );

    expect(result.status).toBe("ineligible");
  });

  it("applies non-metropolitan continued employment uplift as eligible", () => {
    const result = determineProgram(
      "continued-employment",
      {
        companySize: "우선지원대상기업",
        workforceRange: "30to99",
        locationType: "nonMetropolitan",
        situations: ["elderlyHire"],
      },
      {
        "continued-employment.retirementPolicy": "yes",
        "continued-employment.formalPolicy": "yes",
        "continued-employment.ratioCheck": "yes",
        "continued-employment.targetWorker": "yes",
      },
    );

    expect(result.status).toBe("eligible");
    expect(result.rationale[0]).toContain("비수도권");
  });

  it("flags regional employment as follow-up when plan report is missing", () => {
    const result = determineProgram(
      "regional-employment",
      {
        companySize: "우선지원대상기업",
        workforceRange: "30to99",
        locationType: "nonMetropolitan",
        situations: ["regionalExpansion"],
      },
      {
        "regional-employment.planReported": "needs_report",
        "regional-employment.projectType": "qualified",
        "regional-employment.localResident": "yes",
        "regional-employment.maintainSixMonths": "yes",
      },
    );

    expect(result.status).toBe("needs_followup");
  });

  it("marks employment promotion eligible for vulnerable regular hire case", () => {
    const result = determineProgram(
      "employment-promotion",
      {
        companySize: "우선지원대상기업",
        workforceRange: "5to29",
        locationType: "metropolitan",
        situations: ["newHire"],
      },
      {
        "employment-promotion.jobSeekerRegistration": "yes",
        "employment-promotion.regularEmployment": "yes",
        "employment-promotion.maintainSixMonths": "yes",
        "employment-promotion.wageLevel": "yes",
      },
    );

    expect(result.status).toBe("eligible");
  });
});
