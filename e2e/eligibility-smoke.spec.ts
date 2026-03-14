import { expect, test, type APIRequestContext } from "playwright/test";

async function createAndDetermine(
  request: APIRequestContext,
  baseURL: string,
  payload: {
    baseAnswers: {
      companySize: "우선지원대상기업" | "중견기업" | "대규모기업";
      workforceRange: "under5" | "5to29" | "30to99" | "over100";
      locationType: "metropolitan" | "nonMetropolitan";
      situations: string[];
    };
    followUpAnswers: Record<string, string>;
  },
) {
  const createResponse = await request.post(`${baseURL}/api/eligibility/sessions`, {
    data: payload.baseAnswers,
  });
  expect(createResponse.ok()).toBeTruthy();
  const createJson = await createResponse.json();

  const determineResponse = await request.post(
    `${baseURL}/api/eligibility/sessions/${createJson.session.id}/determine`,
    {
      data: payload.followUpAnswers,
    },
  );
  expect(determineResponse.ok()).toBeTruthy();
  const determineJson = await determineResponse.json();

  return {
    createJson,
    determineJson,
  };
}

function getReport(determineJson: any, programId: string) {
  return determineJson.reports.find((report: any) => report.programId === programId);
}

test.describe("eligibility smoke", () => {
  test("production APIs and key pages respond", async ({ request, page, baseURL }) => {
    const healthResponse = await request.get(`${baseURL}/api/health`);
    expect(healthResponse.ok()).toBeTruthy();

    const healthPayload = await healthResponse.json();
    expect(healthPayload.ok).toBe(true);
    expect(healthPayload.coverage.programCount).toBeGreaterThan(0);
    expect(healthPayload.coverage.categoryCount).toBeGreaterThan(0);

    const programsResponse = await request.get(`${baseURL}/api/programs`);
    expect(programsResponse.ok()).toBeTruthy();
    const programsPayload = await programsResponse.json();
    expect(programsPayload.source).toBe("supabase");
    expect(programsPayload.programs.length).toBeGreaterThan(0);

    const configResponse = await request.get(`${baseURL}/api/eligibility/config`);
    expect(configResponse.ok()).toBeTruthy();
    const configPayload = await configResponse.json();
    expect(configPayload.questions.length).toBeGreaterThan(20);
    expect(configPayload.config.priorityProgramIds).toContain("work-life-balance");

    await page.goto(`${baseURL}/check`);
    await expect(page.getByRole("heading", { name: "고용장려금 자격 검토" })).toBeVisible();

    await page.goto(`${baseURL}/admin/login`);
    await expect(page.getByRole("heading", { name: "운영 콘솔 로그인" })).toBeVisible();
  });

  test("prepare package route opens from an eligible result context", async ({ request, page, baseURL }) => {
    const { createJson, determineJson } = await createAndDetermine(request, baseURL!, {
      baseAnswers: {
        companySize: "우선지원대상기업",
        workforceRange: "30to99",
        locationType: "metropolitan",
        situations: ["newHire"],
      },
      followUpAnswers: {
        "employment-promotion.jobSeekerRegistration": "yes",
        "employment-promotion.regularEmployment": "yes",
        "employment-promotion.maintainSixMonths": "yes",
        "employment-promotion.wageLevel": "yes",
      },
    });

    const report = getReport(determineJson, "employment-promotion");
    expect(report.canGenerateDraft).toBe(true);

    await page.goto(
      `${baseURL}/prepare?session=${encodeURIComponent(createJson.session.id)}&subsidies=employment-promotion`,
    );
    await expect(page.getByRole("heading", { name: "준비 패키지 정리" })).toBeVisible();
    await expect(page.getByText("판정 결과 기반 준비 패키지")).toBeVisible();
  });

  test("regional employment journey persists in Supabase and returns needs-followup", async ({ request, baseURL }) => {
    const { createJson, determineJson } = await createAndDetermine(request, baseURL!, {
      baseAnswers: {
        companySize: "우선지원대상기업",
        workforceRange: "30to99",
        locationType: "nonMetropolitan",
        situations: ["regionalExpansion"],
      },
      followUpAnswers: {
        "regional-employment.planReported": "needs_report",
        "regional-employment.projectType": "qualified",
        "regional-employment.localResident": "yes",
        "regional-employment.maintainSixMonths": "yes",
      },
    });

    expect(createJson.storage).toBe("supabase");
    expect(determineJson.storage).toBe("supabase");

    const report = getReport(determineJson, "regional-employment");
    expect(report.status).toBe("needs_followup");
    expect(report.missingItems).toContain("지역고용계획 신고 선행");

    const leadResponse = await request.post(`${baseURL}/api/consultation-leads`, {
      data: {
        name: "E2E 스모크",
        phone: "01012341234",
        company: "E2E 테스트 회사",
        consultType: "지원금 신청 자격 검토",
        message: `지역고용촉진지원금 스모크 테스트 ${Date.now()}`,
        subsidyName: "판정 결과 기반 지원금",
        sessionId: createJson.session.id,
        interestedProgramIds: ["regional-employment"],
        determinationStatuses: { "regional-employment": "needs_followup" },
        missingItems: ["지역고용계획 신고 선행"],
      },
    });
    expect(leadResponse.status()).toBe(201);
    const leadPayload = await leadResponse.json();
    expect(leadPayload.storage).toBe("supabase");
  });

  test("regular conversion out-of-range company shows ineligible result", async ({ request, baseURL }) => {
    const { determineJson } = await createAndDetermine(request, baseURL!, {
      baseAnswers: {
        companySize: "우선지원대상기업",
        workforceRange: "over100",
        locationType: "metropolitan",
        situations: ["regularConversion"],
      },
      followUpAnswers: {
        "regular-conversion.tenureSixMonths": "yes",
        "regular-conversion.formalConversion": "yes",
        "regular-conversion.maintainOneMonth": "yes",
        "regular-conversion.wageIncrease": "yes",
      },
    });

    const report = getReport(determineJson, "regular-conversion");
    expect(report.status).toBe("ineligible");
    expect(report.missingItems).toContain("5인 이상 30인 미만 기업 요건");
  });

  test("employment promotion journey reaches eligible result", async ({ request, baseURL }) => {
    const { determineJson } = await createAndDetermine(request, baseURL!, {
      baseAnswers: {
        companySize: "우선지원대상기업",
        workforceRange: "30to99",
        locationType: "metropolitan",
        situations: ["newHire"],
      },
      followUpAnswers: {
        "employment-promotion.jobSeekerRegistration": "yes",
        "employment-promotion.regularEmployment": "yes",
        "employment-promotion.maintainSixMonths": "yes",
        "employment-promotion.wageLevel": "yes",
      },
    });

    const report = getReport(determineJson, "employment-promotion");
    expect(report.status).toBe("eligible");
  });

  test("youth employment journey reaches needs-followup result", async ({ request, baseURL }) => {
    const { determineJson } = await createAndDetermine(request, baseURL!, {
      baseAnswers: {
        companySize: "중견기업",
        workforceRange: "30to99",
        locationType: "nonMetropolitan",
        situations: ["youthHire"],
      },
      followUpAnswers: {
        "youth-employment.targetYouth": "unknown",
        "youth-employment.regularEmployment": "yes",
        "youth-employment.hours": "yes",
        "youth-employment.maintainSixMonths": "yes",
      },
    });

    const report = getReport(determineJson, "youth-employment");
    expect(report.status).toBe("needs_followup");
    expect(report.missingItems).toContain("취업애로청년 해당 여부 확인");
  });

  test("continued employment journey reaches needs-followup result", async ({ request, baseURL }) => {
    const { determineJson } = await createAndDetermine(request, baseURL!, {
      baseAnswers: {
        companySize: "우선지원대상기업",
        workforceRange: "30to99",
        locationType: "nonMetropolitan",
        situations: ["elderlyHire"],
      },
      followUpAnswers: {
        "continued-employment.retirementPolicy": "yes",
        "continued-employment.formalPolicy": "needs_update",
        "continued-employment.ratioCheck": "unknown",
        "continued-employment.targetWorker": "planned",
      },
    });

    const report = getReport(determineJson, "continued-employment");
    expect(report.status).toBe("needs_followup");
    expect(report.missingItems).toContain("취업규칙 또는 단체협약 개정");
  });

  test("work-life bundle reaches DB-backed needs-followup results", async ({ request, baseURL }) => {
    const { determineJson } = await createAndDetermine(request, baseURL!, {
      baseAnswers: {
        companySize: "우선지원대상기업",
        workforceRange: "30to99",
        locationType: "metropolitan",
        situations: ["workLifeBalance"],
      },
      followUpAnswers: {
        "work-life-balance.shortenHours": "yes",
        "work-life-balance.tracking": "unknown",
        "work-life-45.laborAgreement": "planned",
        "work-life-45.foundationApproval": "unknown",
        "flexible-work.policy": "planned",
        "flexible-work.tracking": "unknown",
      },
    });

    expect(getReport(determineJson, "work-life-balance").status).toBe("needs_followup");
    expect(getReport(determineJson, "flexible-work").status).toBe("needs_followup");
    expect(getReport(determineJson, "work-life-45").status).toBe("needs_followup");
  });

  test("parental leave bundle reaches DB-backed needs-followup results", async ({ request, baseURL }) => {
    const { determineJson } = await createAndDetermine(request, baseURL!, {
      baseAnswers: {
        companySize: "우선지원대상기업",
        workforceRange: "30to99",
        locationType: "metropolitan",
        situations: ["parentalLeave"],
      },
      followUpAnswers: {
        "parental-leave-full.leaveGranted": "planned",
        "parental-leave-replacement.replacementHire": "planned",
        "work-sharing.allowance": "planned",
        "parental-leave-childcare.shortHours": "planned",
      },
    });

    expect(getReport(determineJson, "parental-leave-full").status).toBe("needs_followup");
    expect(getReport(determineJson, "parental-leave-replacement").status).toBe("needs_followup");
    expect(getReport(determineJson, "work-sharing").status).toBe("needs_followup");
    expect(getReport(determineJson, "parental-leave-childcare").status).toBe("needs_followup");
  });

  test("employment maintenance bundle reaches DB-backed needs-followup result", async ({ request, baseURL }) => {
    const { determineJson } = await createAndDetermine(request, baseURL!, {
      baseAnswers: {
        companySize: "우선지원대상기업",
        workforceRange: "30to99",
        locationType: "metropolitan",
        situations: ["employmentMaintenance"],
      },
      followUpAnswers: {
        "employment-maintenance.crisis": "unknown",
      },
    });

    const report = getReport(determineJson, "employment-maintenance");
    expect(report.status).toBe("needs_followup");
    expect(report.missingItems).toContain("경영상 사유 증빙");
  });
});
