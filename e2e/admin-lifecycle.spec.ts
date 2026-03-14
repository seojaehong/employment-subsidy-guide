import { expect, test } from "playwright/test";

const adminEmail = process.env.ADMIN_TEST_EMAIL;
const adminPassword = process.env.ADMIN_TEST_PASSWORD;
const allowPublish = process.env.ALLOW_ADMIN_PUBLISH_SMOKE === "true";

test.describe("admin lifecycle smoke", () => {
  test.skip(!adminEmail || !adminPassword, "ADMIN_TEST_EMAIL and ADMIN_TEST_PASSWORD are required.");

  test("admin can login, create draft, and optionally publish", async ({ request, baseURL }) => {
    const loginResponse = await request.post(`${baseURL}/api/admin?action=login`, {
      data: {
        email: adminEmail,
        password: adminPassword,
      },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginJson = await loginResponse.json();
    const token = loginJson.session.accessToken as string;
    expect(token).toBeTruthy();

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const uniqueSuffix = Date.now().toString();
    const createResponse = await request.post(`${baseURL}/api/admin?action=documents`, {
      headers,
      data: {
        title: `2026 운영 스모크 ${uniqueSuffix}`,
        issuer: "고용노동부",
        baseDate: "2026-03-14",
        fileName: `2026-admin-smoke-${uniqueSuffix}.pdf`,
      },
    });
    expect(createResponse.ok()).toBeTruthy();
    const createJson = await createResponse.json();
    expect(createJson.document.status).toBe("draft");
    expect(createJson.programDrafts.length).toBeGreaterThan(0);
    expect(createJson.questionSets.length).toBeGreaterThan(0);
    expect(createJson.ruleDefinitions.length).toBeGreaterThan(0);

    const documentId = createJson.document.id as string;

    const detailResponse = await request.get(
      `${baseURL}/api/admin?action=document&documentId=${encodeURIComponent(documentId)}`,
      { headers },
    );
    expect(detailResponse.ok()).toBeTruthy();
    const detailJson = await detailResponse.json();
    expect(detailJson.document.id).toBe(documentId);

    const overrideResponse = await request.post(`${baseURL}/api/admin?action=overrides`, {
      headers,
      data: {
        documentVersionId: documentId,
        targetType: "program",
        targetId: "employment-promotion",
        fieldName: "summary",
        value: JSON.stringify("운영 스모크용 override"),
        reason: "운영 smoke test draft validation",
        effectiveFrom: new Date().toISOString(),
      },
    });
    expect(overrideResponse.ok()).toBeTruthy();

    if (!allowPublish) {
      return;
    }

    const publishResponse = await request.post(`${baseURL}/api/admin?action=publish`, {
      headers,
      data: {
        documentId,
      },
    });
    expect(publishResponse.ok()).toBeTruthy();
    const publishJson = await publishResponse.json();
    expect(publishJson.document.status).toBe("published");

    const programsResponse = await request.get(`${baseURL}/api/programs`);
    expect(programsResponse.ok()).toBeTruthy();
    const programsJson = await programsResponse.json();
    expect(programsJson.source).toBe("supabase");
  });
});
