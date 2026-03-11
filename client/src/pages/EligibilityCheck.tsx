// Design: Dark Fintech Minimal — Step-by-step eligibility checker
import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Users,
  Baby,
  UserCheck,
  Clock,
  RefreshCw,
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { subsidyData, categoryColors } from "@/lib/subsidyData";

// ── 질문 정의 ──────────────────────────────────────────────
interface Question {
  id: string;
  text: string;
  subText?: string;
  type: "single" | "multi";
  options: { value: string; label: string; icon?: React.ReactNode }[];
}

const questions: Question[] = [
  {
    id: "companySize",
    text: "기업 규모를 선택해주세요",
    subText: "고용보험 피보험자 수 기준",
    type: "single",
    options: [
      { value: "우선지원대상기업", label: "우선지원대상기업\n(제조업 500인 이하 등)", icon: <Building2 size={20} /> },
      { value: "중견기업", label: "중견기업", icon: <Building2 size={20} /> },
      { value: "대규모기업", label: "대규모기업", icon: <Building2 size={20} /> },
    ],
  },
  {
    id: "situations",
    text: "해당되는 상황을 모두 선택해주세요",
    type: "multi",
    options: [
      { value: "newHire", label: "취약계층 신규 채용 예정", icon: <Users size={20} /> },
      { value: "workLifeBalance", label: "근무시간 단축 또는 유연근무제 도입", icon: <Clock size={20} /> },
      { value: "parentalLeave", label: "출산·육아휴직 관련 지원 필요", icon: <Baby size={20} /> },
      { value: "youthHire", label: "청년 취업애로자 정규직 채용", icon: <UserCheck size={20} /> },
      { value: "elderlyHire", label: "고령자(60세 이상) 고용 관련", icon: <Users size={20} /> },
      { value: "disabilityHire", label: "장애인 고용 관련", icon: <UserCheck size={20} /> },
      { value: "regularConversion", label: "비정규직 정규직 전환", icon: <RefreshCw size={20} /> },
      { value: "employmentMaintenance", label: "경영위기로 고용유지 필요", icon: <Clock size={20} /> },
    ],
  },
  {
    id: "companyAge",
    text: "사업장 규모를 알려주세요",
    subText: "상시 근로자 수 기준",
    type: "single",
    options: [
      { value: "under5", label: "5인 미만" },
      { value: "5to29", label: "5인 이상 ~ 30인 미만" },
      { value: "30to99", label: "30인 이상 ~ 100인 미만" },
      { value: "over100", label: "100인 이상" },
    ],
  },
];

// ── 결과 매핑 ──────────────────────────────────────────────
function getEligibleSubsidies(answers: Record<string, string | string[]>) {
  const companySize = answers.companySize as string;
  const situations = (answers.situations as string[]) || [];
  const companyAge = answers.companyAge as string;

  const eligible: typeof subsidyData = [];

  subsidyData.forEach((s) => {
    let match = false;

    // 기업 규모 체크
    const hasAmount =
      (companySize === "우선지원대상기업" && s.amount.우선지원대상기업) ||
      (companySize === "중견기업" && (s.amount.중견기업 || s.amount.공통)) ||
      (companySize === "대규모기업" && (s.amount.대규모기업 || s.amount.공통)) ||
      s.amount.공통;

    if (!hasAmount) return;

    // 상황별 매핑
    if (situations.includes("newHire") && s.category === "고용창출장려금") match = true;
    if (situations.includes("workLifeBalance") && s.id.startsWith("work-life")) match = true;
    if (situations.includes("workLifeBalance") && s.id === "flexible-work") match = true;
    if (situations.includes("parentalLeave") && s.id.startsWith("parental")) match = true;
    if (situations.includes("parentalLeave") && s.id === "work-sharing") match = true;
    if (situations.includes("youthHire") && s.category === "청년고용장려금") match = true;
    if (situations.includes("elderlyHire") && s.category === "장년고용장려금") match = true;
    if (situations.includes("disabilityHire") && s.category === "장애인고용") match = true;
    if (situations.includes("regularConversion") && s.category === "정규직전환지원") match = true;
    if (situations.includes("employmentMaintenance") && s.category === "고용유지지원금") match = true;

    // 30인 미만 특별 조건
    if (companyAge === "under5" || companyAge === "5to29") {
      if (s.id === "regular-conversion") match = true; // 30인 미만만 가능
    }

    if (match) eligible.push(s);
  });

  return eligible;
}

export default function EligibilityCheck() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showResult, setShowResult] = useState(false);

  const currentQ = questions[step];
  const totalSteps = questions.length;

  const handleSingle = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: value }));
  };

  const handleMulti = (value: string) => {
    const current = (answers[currentQ.id] as string[]) || [];
    if (current.includes(value)) {
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: current.filter((v) => v !== value),
      }));
    } else {
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: [...current, value],
      }));
    }
  };

  const canNext = () => {
    const val = answers[currentQ.id];
    if (!val) return false;
    if (currentQ.type === "multi") return (val as string[]).length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const eligible = showResult ? getEligibleSubsidies(answers) : [];

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container max-w-2xl">
          {!showResult ? (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
              >
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                  style={{
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.3)",
                    color: "#93C5FD",
                  }}
                >
                  <Sparkles size={12} />
                  자격 검토
                </div>
                <h1
                  className="text-3xl font-black mb-3"
                  style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}
                >
                  고용장려금 자격 검토
                </h1>
                <p className="text-sm" style={{ color: "rgba(248,250,252,0.5)" }}>
                  몇 가지 질문에 답하면 귀사에 적합한 지원금을 알려드립니다.
                </p>
              </motion.div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-xs mb-2" style={{ color: "rgba(248,250,252,0.4)" }}>
                  <span>질문 {step + 1} / {totalSteps}</span>
                  <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #3B82F6, #10B981)" }}
                    animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-7 rounded-2xl mb-6"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <h2
                    className="text-xl font-bold mb-1"
                    style={{ color: "#F8FAFC" }}
                  >
                    {currentQ.text}
                  </h2>
                  {currentQ.subText && (
                    <p className="text-sm mb-6" style={{ color: "rgba(248,250,252,0.45)" }}>
                      {currentQ.subText}
                    </p>
                  )}
                  {!currentQ.subText && <div className="mb-6" />}

                  <div className={`grid gap-3 ${currentQ.options.length > 4 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                    {currentQ.options.map((opt) => {
                      const isSelected =
                        currentQ.type === "single"
                          ? answers[currentQ.id] === opt.value
                          : ((answers[currentQ.id] as string[]) || []).includes(opt.value);

                      return (
                        <button
                          key={opt.value}
                          className="flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200"
                          style={{
                            background: isSelected
                              ? "rgba(59,130,246,0.15)"
                              : "rgba(255,255,255,0.04)",
                            border: isSelected
                              ? "1px solid rgba(59,130,246,0.4)"
                              : "1px solid rgba(255,255,255,0.08)",
                            color: isSelected ? "#93C5FD" : "rgba(248,250,252,0.7)",
                          }}
                          onClick={() =>
                            currentQ.type === "single"
                              ? handleSingle(opt.value)
                              : handleMulti(opt.value)
                          }
                        >
                          {opt.icon && (
                            <span
                              className="flex-shrink-0"
                              style={{ color: isSelected ? "#60A5FA" : "rgba(248,250,252,0.35)" }}
                            >
                              {opt.icon}
                            </span>
                          )}
                          <span className="text-sm font-medium whitespace-pre-line leading-snug">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2
                              size={16}
                              className="ml-auto flex-shrink-0"
                              style={{ color: "#60A5FA" }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: step === 0 ? "transparent" : "rgba(255,255,255,0.05)",
                    border: step === 0 ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
                    color: step === 0 ? "transparent" : "rgba(248,250,252,0.6)",
                    cursor: step === 0 ? "default" : "pointer",
                  }}
                  onClick={() => step > 0 && setStep(step - 1)}
                  disabled={step === 0}
                >
                  <ChevronLeft size={16} />
                  이전
                </button>

                <button
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{
                    background: canNext()
                      ? "linear-gradient(135deg, #3B82F6, #2563EB)"
                      : "rgba(255,255,255,0.05)",
                    color: canNext() ? "#fff" : "rgba(248,250,252,0.3)",
                    boxShadow: canNext() ? "0 0 20px rgba(59,130,246,0.3)" : "none",
                    cursor: canNext() ? "pointer" : "not-allowed",
                  }}
                  onClick={canNext() ? handleNext : undefined}
                >
                  {step === totalSteps - 1 ? "결과 확인" : "다음"}
                  <ChevronRight size={16} />
                </button>
              </div>
            </>
          ) : (
            /* Result */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-10">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.3)",
                    color: "#6EE7B7",
                  }}
                >
                  <CheckCircle2 size={12} />
                  검토 완료
                </div>
                <h2
                  className="text-3xl font-black mb-3"
                  style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}
                >
                  {eligible.length > 0
                    ? `${eligible.length}개 지원금 신청 가능`
                    : "조건에 맞는 지원금을 찾지 못했습니다"}
                </h2>
                <p className="text-sm" style={{ color: "rgba(248,250,252,0.5)" }}>
                  {eligible.length > 0
                    ? "아래 지원금을 확인하고 신청 준비를 시작하세요."
                    : "다른 조건으로 다시 검토해보세요."}
                </p>
              </div>

              {eligible.length > 0 && (
                <div className="space-y-4 mb-8">
                  {eligible.map((s, i) => {
                    const color = categoryColors[s.category];
                    return (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.06 }}
                      >
                        <Link href={`/subsidies/${s.id}`}>
                          <div
                            className="group p-5 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.07)",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLDivElement).style.borderColor = color.border;
                              (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
                              (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
                            }}
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-black"
                              style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.text }}
                            >
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-bold" style={{ color: "#F8FAFC" }}>
                                  {s.name}
                                </span>
                                {s.subName && (
                                  <span className="text-xs" style={{ color: color.text }}>
                                    {s.subName}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs" style={{ color: "rgba(248,250,252,0.4)" }}>
                                {s.category}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-bold" style={{ color: color.text }}>
                                {s.amountLabel}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: "rgba(248,250,252,0.3)" }}>
                                {s.duration}
                              </div>
                            </div>
                            <ChevronRight
                              size={16}
                              style={{ color: "rgba(248,250,252,0.25)" }}
                              className="flex-shrink-0 group-hover:translate-x-1 transition-transform"
                            />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(248,250,252,0.7)",
                  }}
                  onClick={() => {
                    setShowResult(false);
                    setStep(0);
                    setAnswers({});
                  }}
                >
                  <RefreshCw size={16} />
                  다시 검토
                </button>
                {eligible.length > 0 && (
                  <Link href={`/apply?subsidies=${eligible.map((s) => s.id).join(",")}`}>
                    <button
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: "linear-gradient(135deg, #10B981, #059669)",
                        color: "#fff",
                        boxShadow: "0 0 20px rgba(16,185,129,0.3)",
                      }}
                    >
                      <ArrowRight size={16} />
                      신청서 초안 생성
                    </button>
                  </Link>
                )}
                <Link href="/subsidies">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                      color: "#fff",
                      boxShadow: "0 0 20px rgba(59,130,246,0.3)",
                    }}
                  >
                    전체 지원금 보기
                    <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
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
          본 검토 결과는 참고용이며, 실제 지원금 신청 시 관할 고용센터 또는 전문 노무사와 상담하시기 바랍니다.
        </div>
      </footer>
    </div>
  );
}
