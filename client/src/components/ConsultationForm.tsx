import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  MessageSquare,
  User,
  Phone,
  Building2,
  Send,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  Database,
} from "lucide-react";
import type { DeterminationStatus } from "@shared/subsidy";
import { createConsultationLead } from "@/lib/api";
import { usePrograms } from "@/hooks/usePrograms";

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? "";

const IS_CONFIGURED =
  EMAILJS_SERVICE_ID !== "" &&
  EMAILJS_TEMPLATE_ID !== "" &&
  EMAILJS_PUBLIC_KEY !== "";

interface ConsultationContext {
  sessionId?: string;
  interestedProgramIds?: string[];
  determinationStatuses?: Record<string, DeterminationStatus>;
  missingItems?: string[];
}

interface ConsultationFormProps {
  subsidyName?: string;
  context?: ConsultationContext;
  programNames?: Record<string, string>;
}

const consultTypes = [
  "지원금 신청 자격 검토",
  "신청 서류 준비 안내",
  "신청 절차 대행",
  "지원금 수령 후 관리",
  "기타 노무 상담",
];

const determinationStatusLabels: Record<DeterminationStatus, string> = {
  eligible: "신청 가능",
  needs_followup: "조금 더 확인 필요",
  ineligible: "조건 다시 확인",
  manual_review: "추가 확인 필요",
};

export default function ConsultationForm({ subsidyName, context, programNames }: ConsultationFormProps) {
  const { programs } = usePrograms({ skipRemote: Boolean(programNames) });
  const [form, setForm] = useState({
    name: "",
    phone: "",
    company: "",
    consultType: consultTypes[0],
    message: "",
    agreePrivacy: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interestedProgramIds = context?.interestedProgramIds ?? [];
  const determinationStatuses = context?.determinationStatuses ?? {};
  const missingItems = context?.missingItems ?? [];
  const programNameLookup = useMemo(
    () =>
      programNames
        ? new Map(Object.entries(programNames))
        : new Map(programs.map((program) => [program.program.legacyId, program.program.name])),
    [programNames, programs],
  );
  const statusSummary = useMemo(
    () =>
      Object.entries(determinationStatuses).map(([programId, status]) => {
        const programName = programNameLookup.get(programId) ?? programId;
        const statusLabel = determinationStatusLabels[status] ?? status;
        return `${programName} - ${statusLabel}`;
      }),
    [determinationStatuses, programNameLookup],
  );
  const summaryPreview = useMemo(() => {
    const unique = Array.from(new Set(statusSummary));
    if (unique.length === 0) return "결과가 정리되면 함께 전달드릴게요.";
    if (unique.length === 1) return `${unique[0]} 상태로 정리되어 있어요.`;
    if (unique.length === 2) return `${unique[0]}, ${unique[1]} 상태로 정리되어 있어요.`;
    return `${unique.slice(0, 2).join(", ")} 외 ${unique.length - 2}개 결과가 함께 정리되어 있어요.`;
  }, [statusSummary]);
  const summaryBadges = useMemo(() => Array.from(new Set(statusSummary)).slice(0, 4), [statusSummary]);
  const missingItemsPreview = useMemo(() => {
    const unique = Array.from(new Set(missingItems));
    if (unique.length === 0) return null;
    if (unique.length <= 3) return unique.join(", ");
    return `${unique.slice(0, 3).join(", ")} 외 ${unique.length - 3}개`;
  }, [missingItems]);
  const missingItemBadges = useMemo(() => Array.from(new Set(missingItems)).slice(0, 4), [missingItems]);
  const nextStepMessages = useMemo(() => {
    if (missingItems.length > 0) {
      return [
        "현재 결과와 보완 항목을 먼저 함께 검토합니다.",
        "가장 먼저 확인할 자료와 순서를 정리해 안내드립니다.",
        "필요하면 준비 패키지나 실제 신청 단계까지 이어서 도와드립니다.",
      ];
    }

    return [
      "현재 결과를 기준으로 실제 준비 순서를 먼저 정리합니다.",
      "신청 일정과 챙길 서류를 간단히 나눠서 안내드립니다.",
      "필요하면 다음 단계 상담이나 서류 준비까지 이어서 도와드립니다.",
    ];
  }, [missingItems]);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const isValid =
    form.name.trim() !== "" &&
    form.phone.replace(/\D/g, "").length >= 10 &&
    form.agreePrivacy;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError(null);

    try {
      if (IS_CONFIGURED) {
        const now = new Date();
        const dateStr = now.toLocaleString("ko-KR", {
          timeZone: "Asia/Seoul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        const templateParams = {
          to_email: "abc@winhr.co.kr",
          from_name: form.name,
          from_phone: form.phone,
          from_company: form.company || "(미입력)",
          reply_to: form.company ? `${form.name} / ${form.company}` : form.name,
          consult_type: form.consultType,
          subsidy_name: subsidyName ?? "일반 상담",
          message: form.message || "(내용 없음)",
          submitted_at: dateStr,
          determination_summary: statusSummary.join(", ") || "(판정 정보 없음)",
          missing_items: missingItems.join(", ") || "(보완 항목 없음)",
        };

        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY,
        );
      }

      try {
        await createConsultationLead({
          name: form.name,
          phone: form.phone,
          company: form.company,
          consultType: form.consultType,
          message: form.message,
          subsidyName,
          sessionId: context?.sessionId,
          interestedProgramIds,
          determinationStatuses,
          missingItems,
        });
      } catch (storeError) {
        console.warn("Lead store fallback failed:", storeError);
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Consultation submit error:", err);
      const message = formatErrorMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#F8FAFC",
    borderRadius: "12px",
    padding: "11px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600" as const,
    marginBottom: "6px",
    color: "rgba(248,250,252,0.45)",
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="px-6 py-5 flex items-center gap-3"
        style={{
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(16,185,129,0.08))",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(59,130,246,0.2)", color: "#60A5FA" }}
        >
          <MessageSquare size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold" style={{ color: "#F8FAFC" }}>
            준비 방향 정리 요청
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "rgba(248,250,252,0.45)" }}>
            {subsidyName
              ? `${subsidyName} 관련 준비 상황을 확인하고 다음 순서를 정리해드립니다.`
              : "결과를 바탕으로 실제 준비 방향과 다음 순서를 정리해드립니다."}
          </p>
        </div>
        <div
          className="ml-auto px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
          style={{
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.25)",
            color: "#6EE7B7",
          }}
        >
          요약 포함
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="flex items-start gap-2 p-3 rounded-xl mb-4 text-xs"
                style={{
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  color: "#93C5FD",
                }}
              >
                <Database size={14} className="flex-shrink-0 mt-0.5" />
                <span>
                  요청이 접수되면 결과와 확인 포인트를 함께 보고 순서대로 안내드립니다.
                </span>
              </div>

              {summaryBadges.length > 0 && (
                <div className="mb-4">
                  <div
                    className="text-[11px] font-semibold mb-2"
                    style={{ color: "rgba(248,250,252,0.45)" }}
                  >
                    현재 확인 결과
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {summaryBadges.map((item) => (
                      <div
                        key={item}
                        className="px-3 py-1.5 rounded-full text-xs"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(248,250,252,0.78)",
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  {statusSummary.length > 4 && (
                    <div className="text-xs mt-2" style={{ color: "rgba(248,250,252,0.5)" }}>
                      {summaryPreview}
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs mb-4" style={{ color: "rgba(248,250,252,0.55)" }}>
                {missingItems.length > 0
                  ? "보완이 필요한 항목이 있다면 우선순위부터 함께 정리해드려요."
                  : "연락처만 남겨주시면 현재 결과를 기준으로 차근차근 검토해드려요."}
              </div>

              {!IS_CONFIGURED && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl mb-4 text-xs"
                  style={{
                    background: "rgba(251,191,36,0.08)",
                    border: "1px solid rgba(251,191,36,0.2)",
                    color: "#FCD34D",
                  }}
                >
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>
                    이메일 알림 설정이 아직 연결되지 않아 현재는 접수 기록만 저장됩니다. 운영 전에 연결 상태만 한 번 확인해 주세요.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label style={labelStyle}>
                    <span className="flex items-center gap-1.5">
                      <User size={11} />
                      담당자명 *
                    </span>
                  </label>
                  <input
                    data-testid="consultation-name-input"
                    style={inputStyle}
                    placeholder="홍길동"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    <span className="flex items-center gap-1.5">
                      <Phone size={11} />
                      연락처 *
                    </span>
                  </label>
                  <input
                    data-testid="consultation-phone-input"
                    style={inputStyle}
                    placeholder="010-0000-0000"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", formatPhone(e.target.value))}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    <span className="flex items-center gap-1.5">
                      <Building2 size={11} />
                      회사명
                    </span>
                  </label>
                  <input
                    data-testid="consultation-company-input"
                    style={inputStyle}
                    placeholder="(주)회사명"
                    value={form.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>어떤 도움이 필요하신가요?</label>
                  <div className="relative">
                    <select
                      data-testid="consultation-type-select"
                      style={{
                        ...inputStyle,
                        paddingRight: "36px",
                        cursor: "pointer",
                        appearance: "none",
                      }}
                      value={form.consultType}
                      onChange={(e) => handleChange("consultType", e.target.value)}
                    >
                      {consultTypes.map((t) => (
                        <option key={t} value={t} style={{ background: "#0A0E1A" }}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "rgba(248,250,252,0.4)" }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label style={labelStyle}>문의 내용</label>
                <textarea
                  data-testid="consultation-message-input"
                  style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
                  placeholder={
                    subsidyName
                      ? `${subsidyName} 관련해 궁금한 점이나 현재 준비 중인 상황을 편하게 적어주세요.`
                      : "판정 결과에서 궁금한 점, 준비 예정 항목, 신청 일정 등을 편하게 남겨주세요."
                  }
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                />
              </div>

              {missingItems.length > 0 && (
                <div
                  className="p-3 rounded-xl mb-4"
                  style={{
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                >
                  <div
                    className="text-[11px] font-semibold mb-2"
                    style={{ color: "#FCD34D" }}
                  >
                    먼저 확인해보면 좋은 항목
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {missingItemBadges.map((item) => (
                      <div
                        key={item}
                        className="px-3 py-1.5 rounded-full text-xs"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(248,250,252,0.82)",
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  {missingItems.length > 4 && (
                    <div className="text-xs" style={{ color: "rgba(248,250,252,0.58)" }}>
                      {missingItemsPreview}
                    </div>
                  )}
                </div>
              )}

              <label className="flex items-start gap-3 mb-5 cursor-pointer">
                <div
                  data-testid="consultation-agree-toggle"
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                  style={{
                    background: form.agreePrivacy
                      ? "rgba(59,130,246,0.8)"
                      : "rgba(255,255,255,0.06)",
                    border: form.agreePrivacy
                      ? "none"
                      : "1px solid rgba(255,255,255,0.15)",
                  }}
                  onClick={() => handleChange("agreePrivacy", !form.agreePrivacy)}
                >
                  {form.agreePrivacy && <CheckCircle2 size={13} style={{ color: "#fff" }} />}
                </div>
                <span
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(248,250,252,0.5)" }}
                >
                  개인정보 수집 및 이용에 동의합니다. 남겨주신 정보는 문의 안내와 후속 지원금 검토 목적으로만 사용됩니다.
                  <span style={{ color: "#60A5FA" }}> (필수)</span>
                </span>
              </label>

              {error && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#F87171",
                  }}
                >
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                data-testid="consultation-submit-button"
                className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: isValid
                    ? "linear-gradient(135deg, #3B82F6, #2563EB)"
                    : "rgba(255,255,255,0.06)",
                  color: isValid ? "#fff" : "rgba(248,250,252,0.3)",
                  boxShadow: isValid ? "0 0 25px rgba(59,130,246,0.3)" : "none",
                  cursor: isValid ? "pointer" : "not-allowed",
                }}
                onClick={handleSubmit}
                disabled={!isValid || loading}
              >
                {loading ? (
                  <>
                    <div
                      className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{
                        borderColor: "rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                      }}
                    />
                    접수 중...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    검토 요청 보내기
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              data-testid="consultation-success-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-8"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
              >
                <CheckCircle2 size={32} style={{ color: "#34D399" }} />
              </div>
              <h4 className="text-lg font-bold mb-2" style={{ color: "#F8FAFC" }}>
                요청이 잘 접수되었어요
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.5)" }}>
                <strong style={{ color: "#F8FAFC" }}>{form.name}</strong>님, 접수가 완료되었습니다.
                <br />
                영업일 기준 1~2일 내에 <strong style={{ color: "#F8FAFC" }}>{form.phone}</strong>로
                편하게 안내드리겠습니다.
              </p>
              <div
                className="mt-5 p-4 rounded-2xl text-left"
                style={{
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.16)",
                }}
              >
                <div className="text-xs font-semibold mb-3" style={{ color: "#93C5FD" }}>
                  접수 후에는 이렇게 이어집니다
                </div>
                <div className="space-y-2">
                  {nextStepMessages.map((item) => (
                    <div key={item} className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.74)" }}>
                      {item}
                    </div>
                  ))}
                </div>
                {missingItems.length > 0 && (
                  <div className="mt-4">
                    <div className="text-[11px] font-semibold mb-2" style={{ color: "#FCD34D" }}>
                      먼저 같이 볼 항목
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {missingItemBadges.map((item) => (
                        <div
                          key={item}
                          className="px-3 py-1.5 rounded-full text-xs"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(248,250,252,0.82)",
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function formatErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      text?: string;
      status?: number;
      message?: string;
    };

    if (candidate.message) {
      return candidate.message;
    }

    if (candidate.status || candidate.text) {
      return `EmailJS 오류${candidate.status ? ` (${candidate.status})` : ""}: ${candidate.text ?? "응답 확인 필요"}`;
    }
  }

  return "상담 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}
