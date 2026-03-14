import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  Copy,
  FileText,
  Printer,
  User,
} from "lucide-react";
import type { DeterminationResult, OperationalProgram } from "@shared/subsidy";
import Navigation from "@/components/Navigation";
import { fetchEligibilitySession } from "@/lib/api";
import { usePrograms } from "@/hooks/usePrograms";
import { categoryColors } from "@/lib/subsidyData";
import { toast } from "sonner";

interface CompanyInfo {
  companyName: string;
  bizNumber: string;
  ceoName: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  employeeCount: string;
  companyType: string;
  industryType: string;
}

const emptyInfo: CompanyInfo = {
  companyName: "",
  bizNumber: "",
  ceoName: "",
  address: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  employeeCount: "",
  companyType: "우선지원대상기업",
  industryType: "",
};

function formatBizNumber(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

function formatPhone(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

interface StoredEligibilityPayload {
  session: {
    id: string;
    baseAnswers: {
      companySize: string;
      workforceRange: string;
      locationType: string;
      situations: string[];
    };
  };
  reports: Array<DeterminationResult & { program: OperationalProgram | null }>;
}

export default function ApplicationDraft() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session");
  const subsidyIds = params.get("subsidies")?.split(",").filter(Boolean) ?? [];
  const { programs } = usePrograms();

  const [step, setStep] = useState<"form" | "preview">("form");
  const [info, setInfo] = useState<CompanyInfo>(emptyInfo);
  const [copied, setCopied] = useState(false);
  const [sessionPayload, setSessionPayload] = useState<StoredEligibilityPayload | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromStorage = sessionStorage.getItem("eligibility-session");
    if (fromStorage) {
      setSessionPayload(JSON.parse(fromStorage) as StoredEligibilityPayload);
    }

    if (!sessionId) return;

    fetchEligibilitySession(sessionId)
      .then((payload) => {
        setSessionPayload(payload as StoredEligibilityPayload);
      })
      .catch(() => {
        // Keep last stored session as fallback.
      });
  }, [sessionId]);

  const programLookup = useMemo(
    () => new Map(programs.map((program) => [program.program.legacyId, program])),
    [programs],
  );

  const selectedReports = useMemo(() => {
    const baseReports = sessionPayload?.reports ?? [];
    return baseReports
      .filter((report) => subsidyIds.length === 0 || subsidyIds.includes(report.programId))
      .filter((report) => report.status === "eligible" || report.status === "needs_followup");
  }, [sessionPayload, subsidyIds]);

  const selectedPrograms = useMemo(() => {
    if (selectedReports.length > 0) {
      return selectedReports
        .map((report) => report.program ?? programLookup.get(report.programId) ?? null)
        .filter(Boolean) as OperationalProgram[];
    }

    return subsidyIds
      .map((programId) => programLookup.get(programId) ?? null)
      .filter(Boolean) as OperationalProgram[];
  }, [programLookup, selectedReports, subsidyIds]);
  const checklistItems = useMemo(
    () => Array.from(new Set(selectedReports.flatMap((report) => [...report.missingItems, ...report.nextActions]))),
    [selectedReports],
  );
  const draftReadyCount = selectedReports.filter((report) => report.status === "eligible").length;
  const followupCount = selectedReports.filter((report) => report.status === "needs_followup").length;

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () =>
    info.companyName.trim() &&
    info.bizNumber.replace(/\D/g, "").length === 10 &&
    info.contactName.trim() &&
    info.contactPhone.replace(/\D/g, "").length >= 10 &&
    selectedPrograms.length > 0;

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const handleCopy = () => {
    if (!previewRef.current) return;
    const text = previewRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("준비 패키지 내용이 클립보드에 복사되었습니다.");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#F8FAFC",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "rgba(248,250,252,0.5)",
  } as const;

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href="/check">
              <button
                className="flex items-center gap-2 text-sm mb-6 transition-colors"
                style={{ color: "rgba(248,250,252,0.4)" }}
              >
                <ArrowLeft size={16} />
                자격 검토로 돌아가기
              </button>
            </Link>

            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "#93C5FD",
              }}
            >
              <FileText size={12} />
              판정 결과 기반 준비 패키지
            </div>
            <h1 className="text-3xl font-black mb-2" style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              준비 패키지 정리
            </h1>
            <p className="text-sm" style={{ color: "rgba(248,250,252,0.5)" }}>
              현재 결과에서 바로 준비를 이어갈 수 있는 제도만 추려서 초안, 확인 항목, PDF 저장용 내용을 함께 정리해드립니다.
            </p>
          </motion.div>

          {selectedPrograms.length === 0 && (
            <div
              className="p-5 rounded-2xl mb-6"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.18)",
              }}
            >
              <div className="text-sm font-bold mb-2" style={{ color: "#FCD34D" }}>
                아직 준비 패키지로 이어질 제도가 없습니다
              </div>
              <div className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.72)" }}>
                현재 결과에서 `신청 가능` 또는 `조금 더 확인 필요`로 나온 제도가 있어야 준비 패키지를 만들 수 있습니다. 자격 검토로 돌아가 결과를 다시 확인해보세요.
              </div>
            </div>
          )}

          {selectedPrograms.length > 0 && (
            <div
              className="p-4 rounded-xl mb-6"
              style={{
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.15)",
              }}
            >
              <div className="text-xs font-semibold mb-3" style={{ color: "#93C5FD" }}>
                준비 패키지 대상
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedPrograms.map((program) => (
                  <span
                    key={program.program.legacyId}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: categoryColors[program.program.category].bg,
                      border: `1px solid ${categoryColors[program.program.category].border}`,
                      color: categoryColors[program.program.category].text,
                    }}
                  >
                    {program.program.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedReports.length > 0 && (
            <div
              className="p-4 rounded-xl mb-6"
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <div className="text-xs font-semibold mb-3" style={{ color: "#6EE7B7" }}>
                현재 결과에서 이어받은 내용
              </div>
              <div className="space-y-2">
                {selectedReports.map((report) => (
                  <div key={report.programId} className="text-sm" style={{ color: "rgba(248,250,252,0.7)" }}>
                    <strong style={{ color: "#F8FAFC" }}>
                      {report.program?.program.name ?? report.programId}
                    </strong>
                    {" · "}
                    {report.summary}
                    {report.missingItems.length > 0 && ` · 먼저 확인: ${report.missingItems.join(", ")}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {checklistItems.length > 0 && (
            <div
              className="p-4 rounded-xl mb-6"
              style={{
                background: "rgba(14,165,233,0.06)",
                border: "1px solid rgba(14,165,233,0.15)",
              }}
            >
              <div className="text-xs font-semibold mb-3" style={{ color: "#7DD3FC" }}>
                먼저 챙겨보면 좋은 항목
              </div>
              <div className="flex flex-wrap gap-2">
                {checklistItems.slice(0, 8).map((item) => (
                  <span
                    key={item}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(248,250,252,0.78)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {selectedPrograms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.14)",
                }}
              >
                <div className="text-xs font-semibold mb-2" style={{ color: "#6EE7B7" }}>
                  이 패키지로 바로 정리할 수 있는 것
                </div>
                <div className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.76)" }}>
                  사업장 정보, 현재 결과 요약, 준비 순서, PDF 저장용 정리본까지 한 번에 묶을 수 있어요.
                  {draftReadyCount > 0 && ` 현재 기준으로 바로 준비를 이어갈 수 있는 제도는 ${draftReadyCount}건입니다.`}
                </div>
              </div>
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "rgba(245,158,11,0.06)",
                  border: "1px solid rgba(245,158,11,0.14)",
                }}
              >
                <div className="text-xs font-semibold mb-2" style={{ color: "#FCD34D" }}>
                  여전히 직접 확인이 필요한 것
                </div>
                <div className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.76)" }}>
                  실제 제출 양식, 최신 운영지침, 증빙 자료 적정성은 따로 확인이 필요합니다.
                  {followupCount > 0 && ` 조금 더 확인이 필요한 제도 ${followupCount}건은 보완 항목을 함께 챙기면서 보시는 편이 좋아요.`}
                </div>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="p-7 rounded-2xl mb-5"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(59,130,246,0.15)", color: "#60A5FA" }}
                    >
                      <Building2 size={14} />
                    </div>
                    <h2 className="text-base font-bold" style={{ color: "#F8FAFC" }}>
                      사업장 정보
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label style={labelStyle}>사업장명 *</label>
                      <input
                        style={inputStyle}
                        placeholder="(주)노무법인 위너스"
                        value={info.companyName}
                        onChange={(e) => handleChange("companyName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>사업자등록번호 *</label>
                      <input
                        style={inputStyle}
                        placeholder="000-00-00000"
                        value={info.bizNumber}
                        onChange={(e) => handleChange("bizNumber", formatBizNumber(e.target.value))}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>대표자명</label>
                      <input
                        style={inputStyle}
                        placeholder="홍길동"
                        value={info.ceoName}
                        onChange={(e) => handleChange("ceoName", e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label style={labelStyle}>사업장 주소</label>
                      <input
                        style={inputStyle}
                        placeholder="서울특별시 강남구 테헤란로 123"
                        value={info.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>상시 근로자 수</label>
                      <input
                        style={inputStyle}
                        placeholder="25"
                        type="number"
                        value={info.employeeCount}
                        onChange={(e) => handleChange("employeeCount", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>기업 구분</label>
                      <select
                        style={{ ...inputStyle, cursor: "pointer" }}
                        value={info.companyType}
                        onChange={(e) => handleChange("companyType", e.target.value)}
                      >
                        <option value="우선지원대상기업">우선지원대상기업</option>
                        <option value="중견기업">중견기업</option>
                        <option value="대규모기업">대규모기업</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label style={labelStyle}>업종</label>
                      <input
                        style={inputStyle}
                        placeholder="제조업, 서비스업, IT 등"
                        value={info.industryType}
                        onChange={(e) => handleChange("industryType", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="p-7 rounded-2xl mb-6"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(16,185,129,0.12)", color: "#34D399" }}
                    >
                      <User size={14} />
                    </div>
                    <h2 className="text-base font-bold" style={{ color: "#F8FAFC" }}>
                      담당자 정보
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>담당자명 *</label>
                      <input
                        style={inputStyle}
                        placeholder="김담당"
                        value={info.contactName}
                        onChange={(e) => handleChange("contactName", e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>연락처 *</label>
                      <input
                        style={inputStyle}
                        placeholder="010-0000-0000"
                        value={info.contactPhone}
                        onChange={(e) => handleChange("contactPhone", formatPhone(e.target.value))}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label style={labelStyle}>이메일</label>
                      <input
                        style={inputStyle}
                        placeholder="contact@company.com"
                        type="email"
                        value={info.contactEmail}
                        onChange={(e) => handleChange("contactEmail", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  className="w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: isFormValid()
                      ? "linear-gradient(135deg, #3B82F6, #2563EB)"
                      : "rgba(255,255,255,0.06)",
                    color: isFormValid() ? "#fff" : "rgba(248,250,252,0.3)",
                    boxShadow: isFormValid() ? "0 0 30px rgba(59,130,246,0.35)" : "none",
                    cursor: isFormValid() ? "pointer" : "not-allowed",
                  }}
                  onClick={() => isFormValid() && setStep("preview")}
                >
                  준비 패키지 생성하기
                  <ChevronRight size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <button
                    className="flex items-center gap-2 text-sm transition-colors"
                    style={{ color: "rgba(248,250,252,0.4)" }}
                    onClick={() => setStep("form")}
                  >
                    <ArrowLeft size={16} />
                    정보 수정
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(248,250,252,0.7)",
                      }}
                      onClick={handleCopy}
                    >
                      {copied ? <CheckCircle2 size={14} style={{ color: "#34D399" }} /> : <Copy size={14} />}
                      {copied ? "복사됨" : "텍스트 복사"}
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                        color: "#fff",
                        boxShadow: "0 0 20px rgba(59,130,246,0.3)",
                      }}
                      onClick={() => window.print()}
                    >
                      <Printer size={14} />
                      인쇄 / PDF 저장
                    </button>
                  </div>
                </div>

                <div
                  ref={previewRef}
                  className="p-8 rounded-2xl print:bg-white print:text-black"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black mb-1" style={{ color: "#F8FAFC", letterSpacing: "-0.01em" }}>
                      고용장려금 준비 패키지
                    </h2>
                    <p className="text-sm" style={{ color: "rgba(248,250,252,0.4)" }}>
                      작성일: {dateStr}
                    </p>
                  </div>

                  {selectedPrograms.length > 0 && (
                    <div className="mb-7">
                      <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(248,250,252,0.35)" }}>
                        신청 지원금
                      </h3>
                      <div className="space-y-2">
                        {selectedPrograms.map((program) => {
                          const report = selectedReports.find(
                            (item) => item.programId === program.program.legacyId,
                          );
                          return (
                            <div
                              key={program.program.legacyId}
                              className="p-4 rounded-xl"
                              style={{
                                background: "rgba(59,130,246,0.06)",
                                border: "1px solid rgba(59,130,246,0.12)",
                              }}
                            >
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>
                                  {program.program.name}
                                </div>
                                <div className="text-sm font-bold" style={{ color: categoryColors[program.program.category].text }}>
                                  {program.program.amountLabel}
                                </div>
                              </div>
                              {report && (
                                <div className="text-xs" style={{ color: "rgba(248,250,252,0.55)" }}>
                                  현재 결과: {report.summary}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mb-7">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(248,250,252,0.35)" }}>
                      사업장 정보
                    </h3>
                    <div className="space-y-2 text-sm" style={{ color: "#F8FAFC" }}>
                      <div>사업장명: {info.companyName}</div>
                      <div>사업자등록번호: {info.bizNumber}</div>
                      <div>대표자명: {info.ceoName || "—"}</div>
                      <div>사업장 주소: {info.address || "—"}</div>
                      <div>상시 근로자 수: {info.employeeCount ? `${info.employeeCount}명` : "—"}</div>
                      <div>기업 구분: {info.companyType}</div>
                      <div>업종: {info.industryType || "—"}</div>
                    </div>
                  </div>

                  <div className="mb-7">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(248,250,252,0.35)" }}>
                      담당자 정보
                    </h3>
                    <div className="space-y-2 text-sm" style={{ color: "#F8FAFC" }}>
                      <div>담당자명: {info.contactName}</div>
                      <div>연락처: {info.contactPhone}</div>
                      <div>이메일: {info.contactEmail || "—"}</div>
                    </div>
                  </div>

                  {selectedReports.length > 0 && (
                    <div className="mb-7">
                      <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(248,250,252,0.35)" }}>
                        결과에서 이어받은 확인 사항
                      </h3>
                      <div className="space-y-4">
                        {selectedReports.map((report) => (
                          <div
                            key={report.programId}
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <div className="text-sm font-bold mb-2" style={{ color: "#F8FAFC" }}>
                              {report.program?.program.name ?? report.programId}
                            </div>
                            <div className="text-xs mb-2" style={{ color: "rgba(248,250,252,0.55)" }}>
                              {report.summary}
                            </div>
                            {report.missingItems.length > 0 && (
                              <div className="text-xs" style={{ color: "rgba(248,250,252,0.6)" }}>
                                먼저 확인: {report.missingItems.join(", ")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {checklistItems.length > 0 && (
                    <div className="mb-7">
                      <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(248,250,252,0.35)" }}>
                        준비 체크리스트
                      </h3>
                      <div className="space-y-2 text-sm" style={{ color: "#F8FAFC" }}>
                        {checklistItems.map((item) => (
                          <div key={item}>- {item}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className="mt-6 p-3 rounded-lg text-xs"
                    style={{
                      background: "rgba(245,158,11,0.06)",
                      border: "1px solid rgba(245,158,11,0.12)",
                      color: "rgba(252,211,77,0.7)",
                      lineHeight: "1.7",
                    }}
                  >
                    이 패키지는 현재 답변과 판정 결과를 바탕으로 준비용 내용을 먼저 정리한 것입니다. 공식 제출 서식은 아니며, 실제 신청 전에는 관할 고용센터 양식과 최신 운영지침을 함께 확인해 주세요.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          nav, footer, button { display: none !important; }
          .print\\:bg-white { background: white !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}
