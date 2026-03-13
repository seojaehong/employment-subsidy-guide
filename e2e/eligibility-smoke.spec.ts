import { expect, test, type Page } from "playwright/test";

async function runCommonFlow(
  page: Page,
  params: {
    companySize: "우선지원대상기업" | "중견기업" | "대규모기업";
    situation: "regionalExpansion" | "regularConversion";
    workforceRange: "under5" | "5to29" | "30to99" | "over100";
    locationType: "metropolitan" | "nonMetropolitan";
  },
) {
  await page.goto("/check");
  await expect(page.getByRole("heading", { name: "고용장려금 자격 검토" })).toBeVisible();

  await page.getByTestId(`eligibility-option-companySize-${params.companySize}`).click();
  await page.getByTestId("common-next-button").click();

  await page.getByTestId(`eligibility-option-situations-${params.situation}`).click();
  await page.getByTestId("common-next-button").click();

  await page.getByTestId(`eligibility-option-workforceRange-${params.workforceRange}`).click();
  await page.getByTestId("common-next-button").click();

  await page.getByTestId(`eligibility-option-locationType-${params.locationType}`).click();
  await page.getByTestId("common-next-button").click();

  await expect(page.getByText("2단계 판정 질문")).toBeVisible();
}

test.describe("eligibility smoke", () => {
  test("production APIs respond with smoke-level health and catalog data", async ({ request, baseURL }) => {
    const healthResponse = await request.get(`${baseURL}/api/health`);
    expect(healthResponse.ok()).toBeTruthy();

    const healthPayload = await healthResponse.json();
    expect(healthPayload.ok).toBe(true);
    expect(healthPayload.coverage.programCount).toBeGreaterThan(0);
    expect(healthPayload.coverage.categoryCount).toBeGreaterThan(0);

    const programsResponse = await request.get(`${baseURL}/api/programs`);
    expect(programsResponse.ok()).toBeTruthy();

    const programsPayload = await programsResponse.json();
    expect(Array.isArray(programsPayload.programs)).toBe(true);
    expect(programsPayload.programs.length).toBeGreaterThan(0);
    expect(programsPayload.programs[0].program.legacyId).toBeTruthy();
  });

  test("regional employment journey reaches needs-followup result and consultation success", async ({ page }) => {
    await page.route("https://api.emailjs.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/plain",
        body: "OK",
      });
    });

    await runCommonFlow(page, {
      companySize: "우선지원대상기업",
      situation: "regionalExpansion",
      workforceRange: "30to99",
      locationType: "nonMetropolitan",
    });

    await page.getByTestId("eligibility-option-regional-employment.planReported-needs_report").click();
    await page.getByTestId("eligibility-option-regional-employment.projectType-qualified").click();
    await page.getByTestId("eligibility-option-regional-employment.localResident-yes").click();
    await page.getByTestId("eligibility-option-regional-employment.maintainSixMonths-yes").click();

    await page.getByTestId("followup-submit-button").click();

    await expect(page.getByRole("heading", { name: "지역고용촉진지원금" })).toBeVisible();
    await expect(page.getByText("보완 필요")).toBeVisible();
    await expect(page.getByText("지역고용계획 신고 선행", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("현재 판정 요약: 지역고용촉진지원금 - 보완 필요")).toBeVisible();

    const uniqueSuffix = Date.now().toString();
    await page.getByTestId("consultation-name-input").fill("E2E 스모크");
    await page.getByTestId("consultation-phone-input").fill("01012341234");
    await page.getByTestId("consultation-company-input").fill("E2E 테스트 회사");
    await page.getByTestId("consultation-message-input").fill(`지역고용촉진지원금 스모크 테스트 ${uniqueSuffix}`);
    await page.getByTestId("consultation-agree-toggle").click();

    const leadResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/consultation-leads") && response.request().method() === "POST",
    );

    await page.getByTestId("consultation-submit-button").click();

    const leadResponse = await leadResponsePromise;
    expect(leadResponse.status()).toBe(201);
    await expect(page.getByTestId("consultation-success-state")).toBeVisible();
    await expect(page.getByText("상담 신청 완료")).toBeVisible();
  });

  test("regular conversion out-of-range company shows ineligible result", async ({ page }) => {
    await runCommonFlow(page, {
      companySize: "우선지원대상기업",
      situation: "regularConversion",
      workforceRange: "over100",
      locationType: "metropolitan",
    });

    await page.getByTestId("eligibility-option-regular-conversion.tenureSixMonths-yes").click();
    await page.getByTestId("eligibility-option-regular-conversion.formalConversion-yes").click();
    await page.getByTestId("eligibility-option-regular-conversion.maintainOneMonth-yes").click();
    await page.getByTestId("eligibility-option-regular-conversion.wageIncrease-yes").click();

    await page.getByTestId("followup-submit-button").click();

    await expect(page.getByRole("heading", { name: "정규직 전환 지원금" })).toBeVisible();
    await expect(page.getByText("현재 제외")).toBeVisible();
    await expect(page.getByText("5인 이상 30인 미만 기업 요건", { exact: true }).first()).toBeVisible();
  });
});
