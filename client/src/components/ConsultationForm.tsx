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
}

const consultTypes = [
  "지원금 신청 자격 검토",
  "신청 서류 준비 안내",
  "신청 절차 대행",
  "지원금 수령 후 관리",
  "기타 노무 상담",
];

export default function ConsultationForm({ subsidyName, context }: ConsultationFormProps) {
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
  const statusSummary = useMemo(
    () =>
      Object.entries(determinationStatuses).map(([programId, status]) => `${programId}: ${status}`),
    [determinationStatuses],
  );

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
      setError("상담 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
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
            노무법인 위너스 전문가 상담
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "rgba(248,250,252,0.45)" }}>
            {subsidyName
              ? `${subsidyName} 관련 전문 노무사와 1:1 상담`
              : "판정 결과를 바탕으로 지원금 신청 가능성을 함께 점검합니다."}
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
          무료 상담
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
                  상담 요청은 운영 DB에도 저장되어 후속 검토와 문서 준비에 활용됩니다.
                  {statusSummary.length > 0 && ` 현재 판정 요약: ${statusSummary.join(", ")}`}
                </span>
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
                    EmailJS 설정이 없어 이메일은 전송되지 않지만, 상담 DB에는 정상 저장됩니다.
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
                    style={inputStyle}
                    placeholder="(주)회사명"
                    value={form.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                  />
                </div>
                <div>
                  <label style={labelStyle}>상담 유형</label>
                  <div className="relative">
                    <select
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
                  style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
                  placeholder={
                    subsidyName
                      ? `${subsidyName} 관련 문의 내용을 입력해주세요.`
                      : "판정 결과에서 궁금한 점이나 준비가 필요한 내용을 입력해주세요."
                  }
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                />
              </div>

              {missingItems.length > 0 && (
                <div
                  className="p-3 rounded-xl mb-4 text-xs"
                  style={{
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    color: "#FCD34D",
                  }}
                >
                  보완 필요 항목: {missingItems.join(", ")}
                </div>
              )}

              <label className="flex items-start gap-3 mb-5 cursor-pointer">
                <div
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
                  개인정보 수집 및 이용에 동의합니다. 수집된 정보는 상담과 후속 지원금 검토 목적으로만 사용됩니다.
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
                    상담 신청하기
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
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
                상담 신청 완료
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.5)" }}>
                <strong style={{ color: "#F8FAFC" }}>{form.name}</strong>님, 접수가 완료되었습니다.
                <br />
                영업일 기준 1~2일 내에 <strong style={{ color: "#F8FAFC" }}>{form.phone}</strong>로
                연락드리겠습니다.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
