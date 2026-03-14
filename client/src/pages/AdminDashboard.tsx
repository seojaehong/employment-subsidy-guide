import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { determinationStatusGuides, type AdminSession, type ConsultationLeadRecord, type DocumentVersionRecord, type OverrideRecord } from "@shared/subsidy";
import { clearAdminToken, getAdminToken } from "@/lib/adminAuth";
import { createAdminDocument, fetchAdminConsultationLeads, fetchAdminDocuments, fetchAdminSession } from "@/lib/api";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [session, setSession] = useState<AdminSession | null>(null);
  const [documents, setDocuments] = useState<DocumentVersionRecord[]>([]);
  const [overrides, setOverrides] = useState<OverrideRecord[]>([]);
  const [leads, setLeads] = useState<ConsultationLeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftForm, setDraftForm] = useState({
    title: "",
    issuer: "고용노동부",
    baseDate: "2026-01-01",
    fileName: "",
  });

  const getLeadSummary = (lead: ConsultationLeadRecord) => {
    const statuses = Object.values(lead.determinationStatuses);
    if (statuses.length === 0) {
      return "일반 문의";
    }

    const counts = statuses.reduce(
      (acc, status) => {
        acc[status] += 1;
        return acc;
      },
      {
        eligible: 0,
        needs_followup: 0,
        ineligible: 0,
        manual_review: 0,
      } as Record<keyof typeof determinationStatusGuides, number>,
    );

    return (Object.keys(counts) as Array<keyof typeof counts>)
      .filter((status) => counts[status] > 0)
      .map((status) => `${determinationStatusGuides[status].label} ${counts[status]}건`)
      .join(" · ");
  };

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const load = async () => {
      try {
        const [sessionResponse, documentsResponse, leadsResponse] = await Promise.all([
          fetchAdminSession(token),
          fetchAdminDocuments(token),
          fetchAdminConsultationLeads(token),
        ]);
        setSession(sessionResponse.session);
        setDocuments(documentsResponse.documents);
        setOverrides(documentsResponse.overrides);
        setLeads(leadsResponse.leads);
      } catch (loadError) {
        clearAdminToken();
        navigate("/admin/login");
        setError(loadError instanceof Error ? loadError.message : "관리자 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [navigate]);

  const handleCreateDocument = async () => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await createAdminDocument(token, draftForm);
      const [documentsResponse, leadsResponse] = await Promise.all([
        fetchAdminDocuments(token),
        fetchAdminConsultationLeads(token),
      ]);
      setDocuments(documentsResponse.documents);
      setOverrides(documentsResponse.overrides);
      setLeads(leadsResponse.leads);
      setDraftForm({ title: "", issuer: "고용노동부", baseDate: "2026-01-01", fileName: "" });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "문서 생성을 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: "#08111F" }}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold mb-2" style={{ color: "#6EE7B7" }}>
              Admin Console
            </div>
            <h1 className="text-3xl font-black" style={{ color: "#F8FAFC" }}>
              문서 기준일 / Override / Publish 관리
            </h1>
            <p className="text-sm mt-2" style={{ color: "rgba(248,250,252,0.55)" }}>
              {session ? `${session.email} · ${session.role}` : "세션 확인 중"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              clearAdminToken();
              navigate("/admin/login");
            }}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC" }}
          >
            로그아웃
          </button>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", color: "#FCA5A5" }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-6">
          <div className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ color: "#F8FAFC" }}>
                문서 버전
              </h2>
              <div className="text-xs" style={{ color: "rgba(248,250,252,0.45)" }}>
                {documents.length}건
              </div>
            </div>
            <div className="space-y-3">
              {documents.map((document) => (
                <Link key={document.id} href={`/admin/documents/${document.id}`}>
                  <button
                    className="w-full rounded-2xl p-4 text-left"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold" style={{ color: "#F8FAFC" }}>{document.title}</div>
                        <div className="text-xs mt-1" style={{ color: "rgba(248,250,252,0.5)" }}>
                          {document.issuer} · 기준일 {document.baseDate}
                        </div>
                      </div>
                      <div className="text-xs font-semibold" style={{ color: "#93C5FD" }}>
                        {document.status}
                      </div>
                    </div>
                  </button>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: "#F8FAFC" }}>새 문서 버전 만들기</h2>
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
                      value={draftForm[key]}
                      onChange={(event) => setDraftForm((prev) => ({ ...prev, [key]: event.target.value }))}
                      className="w-full rounded-xl px-4 py-3 bg-transparent"
                      style={{ border: "1px solid rgba(255,255,255,0.08)", color: "#F8FAFC" }}
                    />
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => void handleCreateDocument()}
                  disabled={loading}
                  className="w-full rounded-xl py-3 text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #3B82F6, #10B981)", color: "#fff" }}
                >
                  문서 draft 생성
                </button>
              </div>
            </div>

            <div className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h2 className="text-lg font-bold mb-4" style={{ color: "#F8FAFC" }}>최근 override</h2>
              <div className="space-y-3 max-h-[360px] overflow-auto">
                {overrides.slice(0, 8).map((override) => (
                  <div key={override.id} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>
                      {override.targetType} · {override.fieldName}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "rgba(248,250,252,0.5)" }}>
                      {override.reason}
                    </div>
                  </div>
                ))}
                {!loading && overrides.length === 0 && (
                  <div className="text-sm" style={{ color: "rgba(248,250,252,0.45)" }}>
                    아직 override가 없습니다.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold" style={{ color: "#F8FAFC" }}>최근 상담 요청</h2>
                <div className="text-xs" style={{ color: "rgba(248,250,252,0.45)" }}>{leads.length}건</div>
              </div>
              <div className="space-y-3 max-h-[360px] overflow-auto">
                {leads.map((lead) => {
                  const statuses = Object.values(lead.determinationStatuses);
                  return (
                    <div key={lead.id} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>
                            {lead.name} · {lead.company ?? "회사명 미입력"}
                          </div>
                          <div className="text-xs mt-1" style={{ color: "rgba(248,250,252,0.5)" }}>
                            {lead.phone} · {lead.consultType}
                            {lead.subsidyName ? ` · ${lead.subsidyName}` : ""}
                          </div>
                        </div>
                        <div className="text-[11px]" style={{ color: "rgba(248,250,252,0.4)" }}>
                          {new Date(lead.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                        </div>
                      </div>
                      {statuses.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(Object.keys(determinationStatusGuides) as Array<keyof typeof determinationStatusGuides>)
                            .filter((status) => statuses.includes(status))
                            .map((status) => (
                            <span
                              key={`${lead.id}-${status}`}
                              className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                              style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: "rgba(248,250,252,0.74)",
                              }}
                            >
                              {determinationStatusGuides[status].label}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs mt-3" style={{ color: "rgba(248,250,252,0.58)" }}>
                        결과 요약: {getLeadSummary(lead)}
                      </div>
                      {lead.missingItems.length > 0 && (
                        <div className="text-xs mt-3" style={{ color: "rgba(248,250,252,0.56)" }}>
                          먼저 볼 항목: {lead.missingItems.slice(0, 3).join(", ")}
                        </div>
                      )}
                    </div>
                  );
                })}
                {!loading && leads.length === 0 && (
                  <div className="text-sm" style={{ color: "rgba(248,250,252,0.45)" }}>
                    아직 접수된 상담 요청이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
