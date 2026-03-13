import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import type { OverrideRecord, ProgramDraftRecord, QuestionSetVersion, RuleDefinition } from "@shared/subsidy";
import { clearAdminToken, getAdminToken } from "@/lib/adminAuth";
import {
  createAdminOverride,
  fetchAdminDocumentDetail,
  publishAdminDocument,
  replaceAdminProgramDrafts,
  replaceAdminQuestionSets,
  replaceAdminRules,
  updateAdminDocument,
} from "@/lib/api";

export default function AdminDocumentDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/admin/documents/:id");
  const documentId = params?.id ?? "";
  const [detail, setDetail] = useState<null | {
    document: { id: string; title: string; issuer: string; baseDate: string; fileName: string; status: "draft" | "review" | "published" };
    programDrafts: ProgramDraftRecord[];
    questionSets: QuestionSetVersion[];
    ruleDefinitions: RuleDefinition[];
    overrides: OverrideRecord[];
  }>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [metaForm, setMetaForm] = useState({ title: "", issuer: "", baseDate: "", fileName: "", status: "draft" as "draft" | "review" | "published" });
  const [programDraftText, setProgramDraftText] = useState("[]");
  const [questionText, setQuestionText] = useState("[]");
  const [ruleText, setRuleText] = useState("[]");
  const [overrideForm, setOverrideForm] = useState({
    targetType: "program",
    targetId: "",
    fieldName: "summary",
    value: "",
    reason: "",
    effectiveFrom: new Date().toISOString(),
  });

  const token = getAdminToken();

  const reload = async () => {
    if (!token || !documentId) return;
    setLoading(true);
    try {
      const response = await fetchAdminDocumentDetail(token, documentId);
      setDetail(response);
      setMetaForm({
        title: response.document.title,
        issuer: response.document.issuer,
        baseDate: response.document.baseDate,
        fileName: response.document.fileName,
        status: response.document.status,
      });
      setProgramDraftText(JSON.stringify(response.programDrafts, null, 2));
      setQuestionText(JSON.stringify(response.questionSets, null, 2));
      setRuleText(JSON.stringify(response.ruleDefinitions, null, 2));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "문서를 불러오지 못했습니다.");
      clearAdminToken();
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    void reload();
  }, [documentId, navigate, token]);

  const parsedProgramDrafts = useMemo(() => {
    try {
      return JSON.parse(programDraftText) as ProgramDraftRecord[];
    } catch {
      return null;
    }
  }, [programDraftText]);

  const parsedQuestions = useMemo(() => {
    try {
      return JSON.parse(questionText) as QuestionSetVersion[];
    } catch {
      return null;
    }
  }, [questionText]);

  const parsedRules = useMemo(() => {
    try {
      return JSON.parse(ruleText) as RuleDefinition[];
    } catch {
      return null;
    }
  }, [ruleText]);

  if (!token) return null;

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "#08111F" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/admin">
              <button className="text-sm mb-3" style={{ color: "#93C5FD" }}>← 대시보드</button>
            </Link>
            <h1 className="text-3xl font-black" style={{ color: "#F8FAFC" }}>
              {detail?.document.title ?? "문서 로딩 중"}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void reload()}
              className="rounded-xl px-4 py-2 text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC" }}
            >
              새로고침
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!token) return;
                setError(null);
                try {
                  await publishAdminDocument(token, documentId);
                  await reload();
                } catch (publishError) {
                  setError(publishError instanceof Error ? publishError.message : "게시 실패");
                }
              }}
              className="rounded-xl px-4 py-2 text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #10B981, #2563EB)", color: "#fff" }}
            >
              게시 실행
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#FCA5A5" }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr,1.1fr] gap-6">
          <div className="space-y-6">
            <section className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: "#F8FAFC" }}>문서 메타</h2>
              <div className="space-y-3">
                {([
                  ["title", "문서명"],
                  ["issuer", "발행기관"],
                  ["baseDate", "기준일"],
                  ["fileName", "파일명"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="block">
                    <div className="text-xs font-semibold mb-2" style={{ color: "rgba(248,250,252,0.45)" }}>{label}</div>
                    <input
                      value={metaForm[key]}
                      onChange={(event) => setMetaForm((prev) => ({ ...prev, [key]: event.target.value }))}
                      className="w-full rounded-xl px-4 py-3 bg-transparent"
                      style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC" }}
                    />
                  </label>
                ))}
                <label className="block">
                  <div className="text-xs font-semibold mb-2" style={{ color: "rgba(248,250,252,0.45)" }}>상태</div>
                  <select
                    value={metaForm.status}
                    onChange={(event) => setMetaForm((prev) => ({ ...prev, status: event.target.value as "draft" | "review" | "published" }))}
                    className="w-full rounded-xl px-4 py-3 bg-transparent"
                    style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC" }}
                  >
                    <option value="draft">draft</option>
                    <option value="review">review</option>
                    <option value="published">published</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!token) return;
                    setError(null);
                    try {
                      await updateAdminDocument(token, documentId, metaForm);
                      await reload();
                    } catch (updateError) {
                      setError(updateError instanceof Error ? updateError.message : "문서 수정 실패");
                    }
                  }}
                  className="w-full rounded-xl py-3 text-sm font-bold"
                  style={{ background: "rgba(59,130,246,0.18)", color: "#93C5FD", border: "1px solid rgba(59,130,246,0.3)" }}
                >
                  문서 메타 저장
                </button>
              </div>
            </section>

            <section className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: "#F8FAFC" }}>Override 추가</h2>
              <div className="space-y-3">
                {([
                  ["targetType", "대상 타입"],
                  ["targetId", "대상 ID"],
                  ["fieldName", "필드명"],
                  ["value", "값"],
                  ["reason", "사유"],
                  ["effectiveFrom", "적용시점"],
                ] as const).map(([key, label]) => (
                  <label key={key} className="block">
                    <div className="text-xs font-semibold mb-2" style={{ color: "rgba(248,250,252,0.45)" }}>{label}</div>
                    <textarea
                      rows={key === "reason" || key === "value" ? 3 : 1}
                      value={overrideForm[key]}
                      onChange={(event) => setOverrideForm((prev) => ({ ...prev, [key]: event.target.value }))}
                      className="w-full rounded-xl px-4 py-3 bg-transparent"
                      style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC" }}
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={async () => {
                    if (!token) return;
                    setError(null);
                    try {
                      await createAdminOverride(token, { ...overrideForm, documentVersionId: documentId });
                      await reload();
                    } catch (overrideError) {
                      setError(overrideError instanceof Error ? overrideError.message : "override 저장 실패");
                    }
                  }}
                  className="w-full rounded-xl py-3 text-sm font-bold"
                  style={{ background: "rgba(16,185,129,0.18)", color: "#6EE7B7", border: "1px solid rgba(16,185,129,0.3)" }}
                >
                  Override 저장
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {([
              {
                title: "프로그램 draft JSON",
                value: programDraftText,
                setValue: setProgramDraftText,
                valid: parsedProgramDrafts !== null,
                save: async () => {
                  if (!token || !parsedProgramDrafts) return;
                  await replaceAdminProgramDrafts(token, documentId, parsedProgramDrafts);
                },
              },
              {
                title: "질문 세트 JSON",
                value: questionText,
                setValue: setQuestionText,
                valid: parsedQuestions !== null,
                save: async () => {
                  if (!token || !parsedQuestions) return;
                  await replaceAdminQuestionSets(token, documentId, parsedQuestions);
                },
              },
              {
                title: "규칙 정의 JSON",
                value: ruleText,
                setValue: setRuleText,
                valid: parsedRules !== null,
                save: async () => {
                  if (!token || !parsedRules) return;
                  await replaceAdminRules(token, documentId, parsedRules);
                },
              },
            ] as const).map((panel) => (
              <section key={panel.title} className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold" style={{ color: "#F8FAFC" }}>{panel.title}</h2>
                  <div className="text-xs" style={{ color: panel.valid ? "#6EE7B7" : "#FCA5A5" }}>
                    {panel.valid ? "JSON 유효" : "JSON 오류"}
                  </div>
                </div>
                <textarea
                  rows={18}
                  value={panel.value}
                  onChange={(event) => panel.setValue(event.target.value)}
                  className="w-full rounded-2xl px-4 py-4 font-mono text-xs bg-transparent"
                  style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#E2E8F0" }}
                />
                <button
                  type="button"
                  disabled={!panel.valid || loading}
                  onClick={async () => {
                    setError(null);
                    try {
                      await panel.save();
                      await reload();
                    } catch (saveError) {
                      setError(saveError instanceof Error ? saveError.message : `${panel.title} 저장 실패`);
                    }
                  }}
                  className="mt-4 rounded-xl px-4 py-3 text-sm font-bold"
                  style={{
                    background: panel.valid ? "linear-gradient(135deg, #3B82F6, #10B981)" : "rgba(255,255,255,0.05)",
                    color: panel.valid ? "#fff" : "rgba(248,250,252,0.4)",
                  }}
                >
                  {panel.title} 저장
                </button>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
