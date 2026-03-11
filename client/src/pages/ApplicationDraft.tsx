// Design: Dark Fintech Minimal — Application draft generator
// Flow: company info form → auto-generated draft preview → print/copy
import { useState, useRef } from "react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  FileText,
  Download,
  Copy,
  CheckCircle2,
  ChevronRight,
  Printer,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { subsidyData, categoryColors } from "@/lib/subsidyData";
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

export default function ApplicationDraft() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const subsidyIds = params.get("subsidies")?.split(",").filter(Boolean) ?? [];

  const selectedSubsidies = subsidyIds
    .map((id) => subsidyData.find((s) => s.id === id))
    .filter(Boolean) as typeof subsidyData;

  const [step, setStep] = useState<"form" | "preview">("form");
  const [info, setInfo] = useState<CompanyInfo>(emptyInfo);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    setInfo((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () =>
    info.companyName.trim() &&
    info.bizNumber.replace(/\D/g, "").length === 10 &&
    info.contactName.trim() &&
    info.contactPhone.replace(/\D/g, "").length >= 10;

  const today = new Date();
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const handleCopy = () => {
    if (!previewRef.current) return;
    const text = previewRef.current.innerText;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("신청서 내용이 클립보드에 복사되었습니다.");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
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
    transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "rgba(248,250,252,0.5)",
  };

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container max-w-3xl">
          {/* Header */}
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
              신청서 초안 자동 생성
            </div>
            <h1
              className="text-3xl font-black mb-2"
              style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}
            >
              신청서 초안 생성
            </h1>
            <p className="text-sm" style={{ color: "rgba(248,250,252,0.5)" }}>
              사업장 정보를 입력하면 지원금 신청서 초안을 자동으로 생성합니다.
            </p>
          </motion.div>

          {/* Selected subsidies */}
          {selectedSubsidies.length > 0 && (
            <div
              className="p-4 rounded-xl mb-6 flex flex-wrap gap-2 items-center"
              style={{
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.15)",
              }}
            >
              <span className="text-xs font-semibold" style={{ color: "#93C5FD" }}>
                신청 대상:
              </span>
              {selectedSubsidies.map((s) => (
                <span
                  key={s.id}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    background: categoryColors[s.category].bg,
                    border: `1px solid ${categoryColors[s.category].border}`,
                    color: categoryColors[s.category].text,
                  }}
                >
                  {s.name}
                </span>
              ))}
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
                  {/* 사업장 정보 */}
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
                        onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>사업자등록번호 *</label>
                      <input
                        style={inputStyle}
                        placeholder="000-00-00000"
                        value={info.bizNumber}
                        onChange={(e) => handleChange("bizNumber", formatBizNumber(e.target.value))}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>대표자명</label>
                      <input
                        style={inputStyle}
                        placeholder="홍길동"
                        value={info.ceoName}
                        onChange={(e) => handleChange("ceoName", e.target.value)}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label style={labelStyle}>사업장 주소</label>
                      <input
                        style={inputStyle}
                        placeholder="서울특별시 강남구 테헤란로 123"
                        value={info.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>상시 근로자 수</label>
                      <input
                        style={inputStyle}
                        placeholder="50"
                        type="number"
                        value={info.employeeCount}
                        onChange={(e) => handleChange("employeeCount", e.target.value)}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>기업 구분</label>
                      <select
                        style={{ ...inputStyle, cursor: "pointer" }}
                        value={info.companyType}
                        onChange={(e) => handleChange("companyType", e.target.value)}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
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
                        onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                  </div>
                </div>

                {/* 담당자 정보 */}
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
                        onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>연락처 *</label>
                      <input
                        style={inputStyle}
                        placeholder="010-0000-0000"
                        value={info.contactPhone}
                        onChange={(e) => handleChange("contactPhone", formatPhone(e.target.value))}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
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
                        onFocus={(e) => (e.target.style.borderColor = "rgba(59,130,246,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
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
                  신청서 초안 생성하기
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
                {/* Action buttons */}
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
                      onClick={handlePrint}
                    >
                      <Printer size={14} />
                      인쇄 / PDF 저장
                    </button>
                  </div>
                </div>

                {/* Draft Preview */}
                <div
                  ref={previewRef}
                  className="p-8 rounded-2xl print:bg-white print:text-black"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "'Pretendard', sans-serif",
                  }}
                >
                  {/* Title */}
                  <div className="text-center mb-8">
                    <h2
                      className="text-2xl font-black mb-1"
                      style={{ color: "#F8FAFC", letterSpacing: "-0.01em" }}
                    >
                      고용장려금 신청서 (초안)
                    </h2>
                    <p className="text-sm" style={{ color: "rgba(248,250,252,0.4)" }}>
                      작성일: {dateStr}
                    </p>
                    <div
                      className="mt-3 mx-auto"
                      style={{
                        width: "60px",
                        height: "2px",
                        background: "linear-gradient(90deg, #3B82F6, #10B981)",
                        borderRadius: "2px",
                      }}
                    />
                  </div>

                  {/* 신청 지원금 */}
                  {selectedSubsidies.length > 0 && (
                    <div className="mb-7">
                      <h3
                        className="text-xs font-bold uppercase tracking-widest mb-3"
                        style={{ color: "rgba(248,250,252,0.35)" }}
                      >
                        신청 지원금
                      </h3>
                      <div className="space-y-2">
                        {selectedSubsidies.map((s, i) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-3 rounded-xl"
                            style={{
                              background: "rgba(59,130,246,0.06)",
                              border: "1px solid rgba(59,130,246,0.12)",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ background: "rgba(59,130,246,0.2)", color: "#93C5FD" }}
                              >
                                {i + 1}
                              </span>
                              <div>
                                <div className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>
                                  {s.name}
                                </div>
                                {s.subName && (
                                  <div className="text-xs" style={{ color: categoryColors[s.category].text }}>
                                    {s.subName}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm font-bold" style={{ color: categoryColors[s.category].text }}>
                              {s.amountLabel}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 사업장 정보 테이블 */}
                  <div className="mb-7">
                    <h3
                      className="text-xs font-bold uppercase tracking-widest mb-3"
                      style={{ color: "rgba(248,250,252,0.35)" }}
                    >
                      사업장 정보
                    </h3>
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {[
                        { label: "사업장명", value: info.companyName },
                        { label: "사업자등록번호", value: info.bizNumber },
                        { label: "대표자명", value: info.ceoName || "—" },
                        { label: "사업장 주소", value: info.address || "—" },
                        { label: "상시 근로자 수", value: info.employeeCount ? `${info.employeeCount}명` : "—" },
                        { label: "기업 구분", value: info.companyType },
                        { label: "업종", value: info.industryType || "—" },
                      ].map((row, i) => (
                        <div
                          key={row.label}
                          className="flex"
                          style={{
                            borderBottom: i < 6 ? "1px solid rgba(255,255,255,0.06)" : "none",
                          }}
                        >
                          <div
                            className="px-4 py-3 text-xs font-semibold w-36 flex-shrink-0"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              color: "rgba(248,250,252,0.45)",
                              borderRight: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            {row.label}
                          </div>
                          <div
                            className="px-4 py-3 text-sm flex-1"
                            style={{ color: "#F8FAFC" }}
                          >
                            {row.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 담당자 정보 */}
                  <div className="mb-7">
                    <h3
                      className="text-xs font-bold uppercase tracking-widest mb-3"
                      style={{ color: "rgba(248,250,252,0.35)" }}
                    >
                      담당자 정보
                    </h3>
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {[
                        { label: "담당자명", value: info.contactName },
                        { label: "연락처", value: info.contactPhone },
                        { label: "이메일", value: info.contactEmail || "—" },
                      ].map((row, i) => (
                        <div
                          key={row.label}
                          className="flex"
                          style={{
                            borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                          }}
                        >
                          <div
                            className="px-4 py-3 text-xs font-semibold w-36 flex-shrink-0"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              color: "rgba(248,250,252,0.45)",
                              borderRight: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            {row.label}
                          </div>
                          <div
                            className="px-4 py-3 text-sm flex-1"
                            style={{ color: "#F8FAFC" }}
                          >
                            {row.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 지원금별 신청 요건 체크리스트 */}
                  {selectedSubsidies.length > 0 && (
                    <div className="mb-7">
                      <h3
                        className="text-xs font-bold uppercase tracking-widest mb-3"
                        style={{ color: "rgba(248,250,252,0.35)" }}
                      >
                        지원금별 신청 요건 체크리스트
                      </h3>
                      <div className="space-y-4">
                        {selectedSubsidies.map((s) => (
                          <div
                            key={s.id}
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: `1px solid ${categoryColors[s.category].border}`,
                            }}
                          >
                            <div
                              className="text-sm font-bold mb-3"
                              style={{ color: categoryColors[s.category].text }}
                            >
                              {s.name}
                            </div>
                            <ul className="space-y-1.5">
                              {s.requirements.slice(0, 4).map((req, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <div
                                    className="w-4 h-4 rounded border mt-0.5 flex-shrink-0"
                                    style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                                  />
                                  <span className="text-xs leading-relaxed" style={{ color: "rgba(248,250,252,0.6)" }}>
                                    {req}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 확인 서명란 */}
                  <div
                    className="pt-6 mt-6"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <p
                      className="text-xs text-center mb-6"
                      style={{ color: "rgba(248,250,252,0.4)", lineHeight: "1.8" }}
                    >
                      위 내용은 사실과 다름이 없으며, 고용보험법 및 관련 법령에 따라<br />
                      성실히 신청하겠습니다.
                    </p>
                    <div className="flex justify-end gap-12">
                      <div className="text-center">
                        <div className="text-xs mb-8" style={{ color: "rgba(248,250,252,0.4)" }}>
                          신청인 (인)
                        </div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "rgba(248,250,252,0.6)" }}
                        >
                          {info.contactName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div
                    className="mt-6 p-3 rounded-lg text-xs"
                    style={{
                      background: "rgba(245,158,11,0.06)",
                      border: "1px solid rgba(245,158,11,0.12)",
                      color: "rgba(252,211,77,0.7)",
                      lineHeight: "1.7",
                    }}
                  >
                    ※ 본 신청서는 참고용 초안이며, 실제 신청 시 관할 고용센터 양식을 사용하시거나 전문 노무사와 상담 후 제출하시기 바랍니다.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="py-8"
        style={{
          background: "rgba(5,8,15,0.9)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container text-center text-xs" style={{ color: "rgba(248,250,252,0.25)" }}>
          본 사이트의 정보는 참고용이며, 실제 지원금 신청 시 관할 고용센터 또는 전문 노무사와 상담하시기 바랍니다.
        </div>
      </footer>

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
