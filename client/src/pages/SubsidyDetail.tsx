// Design: Dark Fintech Minimal — Subsidy detail page with full information
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  FileText,
  ChevronRight,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import ConsultationForm from "@/components/ConsultationForm";
import { categoryColors } from "@/lib/subsidyData";
import { usePrograms } from "@/hooks/usePrograms";

export default function SubsidyDetail() {
  const { id } = useParams<{ id: string }>();
  const { programs } = usePrograms();
  const operational = programs.find((entry) => entry.program.legacyId === id);
  const subsidy = operational?.program;
  const rule = operational?.rule;

  if (!subsidy || !rule) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0E1A" }}>
        <Navigation />
        <div className="text-center pt-24">
          <p className="text-lg mb-4" style={{ color: "rgba(248,250,252,0.5)" }}>
            지원금 정보를 찾을 수 없습니다.
          </p>
          <Link href="/subsidies">
            <button
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "rgba(59,130,246,0.2)", color: "#93C5FD", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              목록으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const color = categoryColors[subsidy.category];

  // Related subsidies (same category, different id)
  const related = programs
    .filter((entry) => entry.program.category === subsidy.category && entry.program.legacyId !== subsidy.legacyId)
    .slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <Navigation />

      {/* Hero Header */}
      <div
        className="pt-24 pb-12"
        style={{
          background: `linear-gradient(180deg, ${color.bg} 0%, transparent 100%)`,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2 mb-6 text-sm"
            style={{ color: "rgba(248,250,252,0.4)" }}
          >
            <Link href="/">
              <span className="hover:text-white/70 cursor-pointer transition-colors">홈</span>
            </Link>
            <ChevronRight size={14} />
            <Link href="/subsidies">
              <span className="hover:text-white/70 cursor-pointer transition-colors">지원금 안내</span>
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: color.text }}>{subsidy.name}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  color: color.text,
                }}
              >
              {subsidy.category}
            </span>
              {subsidy.highlight && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(252,211,77,0.1)",
                    border: "1px solid rgba(252,211,77,0.3)",
                    color: "#FCD34D",
                  }}
                >
                  주요 지원금
                </span>
              )}
            </div>

            <h1
              className="text-3xl md:text-4xl font-black mb-2"
              style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}
            >
                              {subsidy.name}
            </h1>
            {subsidy.subName && (
              <div className="text-lg font-semibold mb-4" style={{ color: color.text }}>
                {subsidy.subName}
              </div>
            )}
            <p
              className="text-base leading-relaxed max-w-2xl"
              style={{ color: "rgba(248,250,252,0.6)" }}
            >
                              {subsidy.summary}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* 지원 요건 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(59,130,246,0.15)", color: "#60A5FA" }}
                >
                  <CheckCircle2 size={16} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: "#F8FAFC" }}>
                  지원 요건
                </h2>
              </div>
              <ul className="space-y-3">
                {rule.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: "#34D399" }}
                    />
                    <span className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.75)" }}>
                      {req}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* 지원 금액 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="p-6 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(252,211,77,0.12)", color: "#FCD34D" }}
                >
                  <DollarSign size={16} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: "#F8FAFC" }}>
                  지원 금액
                </h2>
              </div>

              <div className="space-y-3">
                {subsidy.baseAmount.공통 && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: "rgba(252,211,77,0.06)",
                      border: "1px solid rgba(252,211,77,0.15)",
                    }}
                  >
                    <div className="text-xs font-semibold mb-1" style={{ color: "rgba(252,211,77,0.7)" }}>
                      공통
                    </div>
                    <div className="text-sm leading-relaxed" style={{ color: "#F8FAFC" }}>
                      {subsidy.baseAmount.공통}
                    </div>
                  </div>
                )}
                {subsidy.baseAmount.우선지원대상기업 && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: "rgba(59,130,246,0.06)",
                      border: "1px solid rgba(59,130,246,0.15)",
                    }}
                  >
                    <div className="text-xs font-semibold mb-1" style={{ color: "rgba(147,197,253,0.7)" }}>
                      우선지원대상기업
                    </div>
                    <div className="text-sm leading-relaxed" style={{ color: "#F8FAFC" }}>
                      {subsidy.baseAmount.우선지원대상기업}
                    </div>
                  </div>
                )}
                {subsidy.baseAmount.중견기업 && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: "rgba(16,185,129,0.06)",
                      border: "1px solid rgba(16,185,129,0.15)",
                    }}
                  >
                    <div className="text-xs font-semibold mb-1" style={{ color: "rgba(110,231,183,0.7)" }}>
                      중견기업
                    </div>
                    <div className="text-sm leading-relaxed" style={{ color: "#F8FAFC" }}>
                      {subsidy.baseAmount.중견기업}
                    </div>
                  </div>
                )}
                {subsidy.baseAmount.대규모기업 && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: "rgba(139,92,246,0.06)",
                      border: "1px solid rgba(139,92,246,0.15)",
                    }}
                  >
                    <div className="text-xs font-semibold mb-1" style={{ color: "rgba(196,181,253,0.7)" }}>
                      대규모기업
                    </div>
                    <div className="text-sm leading-relaxed" style={{ color: "#F8FAFC" }}>
                      {subsidy.baseAmount.대규모기업}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* 지원 기간 및 신청 주기 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(16,185,129,0.12)", color: "#34D399" }}
                >
                  <Clock size={16} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: "#F8FAFC" }}>
                  지원 기간 및 신청
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: "rgba(16,185,129,0.06)",
                    border: "1px solid rgba(16,185,129,0.12)",
                  }}
                >
                  <div className="text-xs font-semibold mb-1" style={{ color: "rgba(110,231,183,0.6)" }}>
                    지원 기간
                  </div>
                  <div className="text-sm font-medium" style={{ color: "#F8FAFC" }}>
                  {subsidy.duration}
                  </div>
                </div>
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: "rgba(16,185,129,0.06)",
                    border: "1px solid rgba(16,185,129,0.12)",
                  }}
                >
                  <div className="text-xs font-semibold mb-1" style={{ color: "rgba(110,231,183,0.6)" }}>
                    신청 주기
                  </div>
                  <div className="text-sm font-medium" style={{ color: "#F8FAFC" }}>
                  {subsidy.applicationCycle}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 지원 제외 */}
            {rule.exclusions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="p-6 rounded-2xl"
                style={{
                  background: "rgba(239,68,68,0.04)",
                  border: "1px solid rgba(239,68,68,0.12)",
                }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(239,68,68,0.12)", color: "#F87171" }}
                  >
                    <XCircle size={16} />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: "#F8FAFC" }}>
                    지원 제외 사항
                  </h2>
                </div>
                <ul className="space-y-2">
                  {rule.exclusions.map((exc, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <XCircle
                        size={14}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: "#F87171" }}
                      />
                      <span className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.65)" }}>
                        {exc}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* 유의사항 */}
            {rule.notes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="p-6 rounded-2xl"
                style={{
                  background: "rgba(245,158,11,0.04)",
                  border: "1px solid rgba(245,158,11,0.12)",
                }}
              >
                <div className="flex items-center gap-2 mb-5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(245,158,11,0.12)", color: "#FCD34D" }}
                  >
                    <AlertTriangle size={16} />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: "#F8FAFC" }}>
                    유의사항
                  </h2>
                </div>
                <ul className="space-y-2">
                  {rule.notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <AlertTriangle
                        size={14}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: "#FCD34D" }}
                      />
                      <span className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.65)" }}>
                        {note}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Quick Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-5 rounded-2xl sticky top-24"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <h3 className="text-sm font-bold mb-4" style={{ color: "#F8FAFC" }}>
                핵심 정보
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="text-xs mb-1" style={{ color: "rgba(248,250,252,0.35)" }}>
                    대표 지원 금액
                  </div>
                  <div className="text-xl font-black" style={{ color: color.text }}>
                    {subsidy.amountLabel}
                  </div>
                </div>

                <div
                  className="h-px"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />

                <div>
                  <div className="text-xs mb-1" style={{ color: "rgba(248,250,252,0.35)" }}>
                    지원 기간
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>
                    {subsidy.duration}
                  </div>
                </div>

                <div>
                  <div className="text-xs mb-1" style={{ color: "rgba(248,250,252,0.35)" }}>
                    신청 주기
                  </div>
                  <div className="text-sm font-semibold" style={{ color: "#F8FAFC" }}>
                    {subsidy.applicationCycle}
                  </div>
                </div>

                <div>
                  <div className="text-xs mb-2" style={{ color: "rgba(248,250,252,0.35)" }}>
                    관련 태그
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {subsidy.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(248,250,252,0.5)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Link href="/check">
                  <button
                    className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-200"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                      color: "#fff",
                      boxShadow: "0 0 20px rgba(59,130,246,0.3)",
                    }}
                  >
                    자격 검토 시작하기
                  </button>
                </Link>
                <Link href="/subsidies">
                  <button
                    className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(248,250,252,0.7)",
                    }}
                  >
                    목록으로 돌아가기
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Consultation Form */}
        <div className="mt-12">
          <ConsultationForm subsidyName={subsidy.name} />
        </div>

        {/* Related Subsidies */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2
              className="text-xl font-bold mb-6"
              style={{ color: "#F8FAFC" }}
            >
              같은 카테고리의 지원금
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((rel) => {
                const relColor = categoryColors[rel.program.category];
                return (
                  <Link key={rel.program.legacyId} href={`/subsidies/${rel.program.legacyId}`}>
                    <div
                      className="group p-5 rounded-2xl cursor-pointer transition-all duration-300"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = relColor.border;
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                      }}
                    >
                      <h3 className="text-sm font-bold mb-1" style={{ color: "#F8FAFC" }}>
                        {rel.program.name}
                      </h3>
                      {rel.program.subName && (
                        <div className="text-xs mb-2" style={{ color: relColor.text }}>
                          {rel.program.subName}
                        </div>
                      )}
                      <div className="text-sm font-semibold" style={{ color: relColor.text }}>
                        {rel.program.amountLabel}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="py-8 mt-16"
        style={{
          background: "rgba(5,8,15,0.9)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="container text-center text-xs" style={{ color: "rgba(248,250,252,0.25)" }}>
          본 검토 결과는 참고용이며, 실제지원금 신청시 노무법인 위너스에 연락주시면 친절하게 상담드리겠습니다.
        </div>
      </footer>
    </div>
  );
}
