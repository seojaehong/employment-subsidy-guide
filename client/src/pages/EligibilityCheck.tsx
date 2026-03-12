import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type {
  BaseEligibilityAnswers,
  DeterminationResult,
  EligibilityQuestionRecord,
  FollowUpAnswers,
  OperationalProgram,
  RecommendationRecord,
} from "@shared/subsidy";
import Navigation from "@/components/Navigation";
import ConsultationForm from "@/components/ConsultationForm";
import {
  createEligibilitySession,
  determineEligibilitySession,
  fetchEligibilityConfig,
} from "@/lib/api";
import { usePrograms } from "@/hooks/usePrograms";
import { categoryColors } from "@/lib/subsidyData";

type FlowStep = "common" | "followup" | "result";

interface SessionCreateResponse {
  session: {
    id: string;
    baseAnswers: BaseEligibilityAnswers;
    recommendations: RecommendationRecord[];
  };
  recommendedPrograms: { program: OperationalProgram | null }[];
  followUpQuestions: EligibilityQuestionRecord[];
}

interface DetermineResponse {
  session: {
    id: string;
    baseAnswers: BaseEligibilityAnswers;
  };
  reports: Array<DeterminationResult & { program: OperationalProgram | null }>;
}

const resultLabels = {
  eligible: "신청 가능",
  needs_followup: "보완 필요",
  ineligible: "현재 제외",
  manual_review: "추가 확인 필요",
} as const;

const resultColors = {
  eligible: {
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
    text: "#6EE7B7",
  },
  needs_followup: {
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    text: "#93C5FD",
  },
  ineligible: {
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    text: "#FCA5A5",
  },
  manual_review: {
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    text: "#FCD34D",
  },
} as const;

export default function EligibilityCheck() {
  const { programs } = usePrograms();
  const [flowStep, setFlowStep] = useState<FlowStep>("common");
  const [commonQuestions, setCommonQuestions] = useState<EligibilityQuestionRecord[]>([]);
  const [commonAnswers, setCommonAnswers] = useState<Record<string, string | string[]>>({});
  const [commonStepIndex, setCommonStepIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recommendedPrograms, setRecommendedPrograms] = useState<OperationalProgram[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<EligibilityQuestionRecord[]>([]);
  const [followUpAnswers, setFollowUpAnswers] = useState<FollowUpAnswers>({});
  const [reports, setReports] = useState<Array<DeterminationResult & { program: OperationalProgram | null }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEligibilityConfig()
      .then((payload) => {
        const typedPayload = payload as { config: { commonQuestions: EligibilityQuestionRecord[] } };
        setCommonQuestions(typedPayload.config.commonQuestions);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "검토 질문을 불러오지 못했습니다.");
      });
  }, []);

  const currentQuestion = commonQuestions[commonStepIndex];

  const normalisedBaseAnswers = useMemo(() => {
    if (!commonAnswers.companySize || !commonAnswers.workforceRange || !commonAnswers.locationType) {
      return null;
    }

    return {
      companySize: commonAnswers.companySize,
      workforceRange: commonAnswers.workforceRange,
      locationType: commonAnswers.locationType,
      situations: (commonAnswers.situations as string[]) ?? [],
    } as BaseEligibilityAnswers;
  }, [commonAnswers]);

  const applicableReports = reports.filter(
    (report) => report.status === "eligible" || report.status === "needs_followup",
  );

  const determinationStatuses = Object.fromEntries(
    reports.map((report) => [report.programId, report.status]),
  );

  const missingItems = Array.from(
    new Set(reports.flatMap((report) => report.missingItems)),
  );

  const selectedProgramIds = applicableReports.map((report) => report.programId);

  const handleAnswer = (question: EligibilityQuestionRecord, value: string) => {
    setError(null);
    if (question.type === "multi") {
      const existing = ((commonAnswers[question.id] as string[]) ?? []).slice();
      const next = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value];
      setCommonAnswers((prev) => ({ ...prev, [question.id]: next }));
      return;
    }

    setCommonAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleFollowUpAnswer = (questionId: string, value: string) => {
    setFollowUpAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const canProceedCommon = useMemo(() => {
    if (!currentQuestion) return false;
    const currentValue = commonAnswers[currentQuestion.id];
    if (!currentValue) return false;
    if (currentQuestion.type === "multi") return (currentValue as string[]).length > 0;
    return true;
  }, [commonAnswers, currentQuestion]);

  const canSubmitFollowUp = followUpQuestions.every((question) => {
    const value = followUpAnswers[question.id];
    return typeof value === "string" && value.length > 0;
  });

  const programLookup = useMemo(() => {
    return new Map(programs.map((program) => [program.program.legacyId, program]));
  }, [programs]);

  const startRecommendation = async () => {
    if (!normalisedBaseAnswers) return;
    setLoading(true);
    setError(null);

    try {
      const payload = (await createEligibilitySession(normalisedBaseAnswers)) as SessionCreateResponse;
      setSessionId(payload.session.id);
      const resolvedPrograms = payload.recommendedPrograms
        .map((entry, index) => {
          if (entry.program) return entry.program;
          const recommendation = payload.session.recommendations[index];
          return recommendation ? programLookup.get(recommendation.programId) ?? null : null;
        })
        .filter(Boolean) as OperationalProgram[];
      setRecommendedPrograms(resolvedPrograms);
      setFollowUpQuestions(payload.followUpQuestions);
      setFlowStep("followup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "추천 결과를 생성하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const submitDetermination = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);

    try {
      const payload = (await determineEligibilitySession(sessionId, followUpAnswers)) as DetermineResponse;
      setReports(payload.reports);
      sessionStorage.setItem("eligibility-session", JSON.stringify(payload));
      setFlowStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "판정 결과를 생성하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setFlowStep("common");
    setCommonAnswers({});
    setCommonStepIndex(0);
    setSessionId(null);
    setRecommendedPrograms([]);
    setFollowUpQuestions([]);
    setFollowUpAnswers({});
    setReports([]);
    setError(null);
  };

  const renderQuestionOptions = (question: EligibilityQuestionRecord, useFollowUp = false) => (
    <div
      className={`grid gap-3 ${
        question.options.length > 4 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {question.options.map((option) => {
        const answerSource = useFollowUp ? followUpAnswers : commonAnswers;
        const isSelected =
          question.type === "multi"
            ? ((answerSource[question.id] as string[]) ?? []).includes(option.value)
            : answerSource[question.id] === option.value;

        return (
          <button
            key={option.value}
            className="flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200"
            style={{
              background: isSelected ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
              border: isSelected
                ? "1px solid rgba(59,130,246,0.4)"
                : "1px solid rgba(255,255,255,0.08)",
              color: isSelected ? "#93C5FD" : "rgba(248,250,252,0.7)",
            }}
            onClick={() =>
              useFollowUp
                ? handleFollowUpAnswer(question.id, option.value)
                : handleAnswer(question, option.value)
            }
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{option.label}</div>
              {option.description && (
                <div className="text-xs mt-1" style={{ color: "rgba(248,250,252,0.45)" }}>
                  {option.description}
                </div>
              )}
            </div>
            {isSelected && <CheckCircle2 size={16} style={{ color: "#60A5FA" }} />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container max-w-5xl">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
              style={{
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.3)",
                color: "#93C5FD",
              }}
            >
              <Sparkles size={12} />
              추천 + 판정 혼합형 자격 검토
            </div>
            <h1 className="text-3xl font-black mb-3" style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              고용장려금 자격 검토
            </h1>
            <p className="text-sm" style={{ color: "rgba(248,250,252,0.5)" }}>
              1단계에서 후보 제도를 압축하고, 2단계에서 핵심 요건을 추가 확인해 판정 리포트를 제공합니다.
            </p>
          </div>

          {error && (
            <div
              className="p-4 rounded-xl mb-6 text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.18)",
                color: "#FCA5A5",
              }}
            >
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {flowStep === "common" && currentQuestion && (
              <motion.div
                key={`common-${commonStepIndex}`}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <div className="flex justify-between text-xs mb-2" style={{ color: "rgba(248,250,252,0.4)" }}>
                    <span>1단계 추천 질문 {commonStepIndex + 1} / {commonQuestions.length}</span>
                    <span>{Math.round(((commonStepIndex + 1) / commonQuestions.length) * 100)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #3B82F6, #10B981)" }}
                      animate={{ width: `${((commonStepIndex + 1) / commonQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div
                  className="p-7 rounded-2xl mb-6"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <h2 className="text-xl font-bold mb-1" style={{ color: "#F8FAFC" }}>
                    {currentQuestion.prompt}
                  </h2>
                  {currentQuestion.helper && (
                    <p className="text-sm mb-6" style={{ color: "rgba(248,250,252,0.45)" }}>
                      {currentQuestion.helper}
                    </p>
                  )}
                  {!currentQuestion.helper && <div className="mb-6" />}
                  {renderQuestionOptions(currentQuestion)}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: commonStepIndex === 0 ? "transparent" : "rgba(255,255,255,0.05)",
                      border:
                        commonStepIndex === 0 ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
                      color: commonStepIndex === 0 ? "transparent" : "rgba(248,250,252,0.6)",
                      cursor: commonStepIndex === 0 ? "default" : "pointer",
                    }}
                    onClick={() => commonStepIndex > 0 && setCommonStepIndex((prev) => prev - 1)}
                    disabled={commonStepIndex === 0}
                  >
                    <ChevronLeft size={16} />
                    이전
                  </button>

                  <button
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                    style={{
                      background: canProceedCommon
                        ? "linear-gradient(135deg, #3B82F6, #2563EB)"
                        : "rgba(255,255,255,0.05)",
                      color: canProceedCommon ? "#fff" : "rgba(248,250,252,0.3)",
                      boxShadow: canProceedCommon ? "0 0 20px rgba(59,130,246,0.3)" : "none",
                      cursor: canProceedCommon ? "pointer" : "not-allowed",
                    }}
                    onClick={() => {
                      if (!canProceedCommon) return;
                      if (commonStepIndex < commonQuestions.length - 1) {
                        setCommonStepIndex((prev) => prev + 1);
                        return;
                      }
                      void startRecommendation();
                    }}
                    disabled={!canProceedCommon || loading}
                  >
                    {commonStepIndex === commonQuestions.length - 1 ? "후보 제도 찾기" : "다음"}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {flowStep === "followup" && (
              <motion.div
                key="followup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-6">
                  <div
                    className="p-5 rounded-2xl h-fit"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4" style={{ color: "#93C5FD" }}>
                      <ShieldCheck size={16} />
                      <span className="text-sm font-bold">후보 제도</span>
                    </div>
                    <div className="space-y-3">
                      {recommendedPrograms.map((program) => {
                        const color = categoryColors[program.program.category];
                        return (
                          <div
                            key={program.program.legacyId}
                            className="p-4 rounded-xl"
                            style={{
                              background: color.bg,
                              border: `1px solid ${color.border}`,
                            }}
                          >
                            <div className="text-xs font-semibold mb-1" style={{ color: color.text }}>
                              {program.program.category}
                            </div>
                            <div className="text-sm font-bold mb-1" style={{ color: "#F8FAFC" }}>
                              {program.program.name}
                            </div>
                            <div className="text-xs" style={{ color: "rgba(248,250,252,0.55)" }}>
                              {program.program.amountLabel}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div
                      className="p-6 rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2" style={{ color: "#6EE7B7" }}>
                        <ClipboardList size={16} />
                        <span className="text-sm font-bold">2단계 판정 질문</span>
                      </div>
                      <h2 className="text-xl font-bold mb-2" style={{ color: "#F8FAFC" }}>
                        후보 제도의 핵심 요건을 확인합니다
                      </h2>
                      <p className="text-sm" style={{ color: "rgba(248,250,252,0.5)" }}>
                        아래 질문에 답하면 `신청 가능`, `보완 필요`, `현재 제외`, `추가 확인 필요` 상태로 정리됩니다.
                      </p>
                    </div>

                    {recommendedPrograms.map((program) => {
                      const questions = followUpQuestions.filter(
                        (question) => question.programId === program.program.legacyId,
                      );
                      const color = categoryColors[program.program.category];
                      return (
                        <div
                          key={program.program.legacyId}
                          className="p-6 rounded-2xl"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid ${color.border}`,
                          }}
                        >
                          <div className="mb-5">
                            <div className="text-xs font-semibold mb-1" style={{ color: color.text }}>
                              {program.program.category}
                            </div>
                            <h3 className="text-lg font-bold" style={{ color: "#F8FAFC" }}>
                              {program.program.name}
                            </h3>
                            <p className="text-sm mt-2" style={{ color: "rgba(248,250,252,0.55)" }}>
                              {program.program.summary}
                            </p>
                          </div>

                          <div className="space-y-5">
                            {questions.map((question) => (
                              <div key={question.id}>
                                <div className="text-sm font-semibold mb-1" style={{ color: "#F8FAFC" }}>
                                  {question.prompt}
                                </div>
                                {question.helper && (
                                  <div className="text-xs mb-3" style={{ color: "rgba(248,250,252,0.45)" }}>
                                    {question.helper}
                                  </div>
                                )}
                                {renderQuestionOptions(question, true)}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(248,250,252,0.7)",
                        }}
                        onClick={() => setFlowStep("common")}
                      >
                        <ChevronLeft size={16} />
                        1단계로 돌아가기
                      </button>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          background: canSubmitFollowUp
                            ? "linear-gradient(135deg, #10B981, #059669)"
                            : "rgba(255,255,255,0.05)",
                          color: canSubmitFollowUp ? "#fff" : "rgba(248,250,252,0.3)",
                          boxShadow: canSubmitFollowUp ? "0 0 20px rgba(16,185,129,0.3)" : "none",
                        }}
                        disabled={!canSubmitFollowUp || loading}
                        onClick={() => void submitDetermination()}
                      >
                        판정 리포트 생성
                        <FileText size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {flowStep === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
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
                    판정 완료
                  </div>
                  <h2 className="text-3xl font-black mb-3" style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}>
                    {applicableReports.length > 0
                      ? `${applicableReports.length}개 제도가 다음 단계 진행 가능`
                      : "추가 확인이 필요한 상태입니다"}
                  </h2>
                  <p className="text-sm" style={{ color: "rgba(248,250,252,0.5)" }}>
                    판정 상태와 근거, 보완 항목, 다음 행동을 기준으로 실무 준비를 진행하세요.
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {reports.map((report) => {
                    const color = report.program
                      ? categoryColors[report.program.program.category]
                      : { text: "#93C5FD", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.18)" };
                    const statusTheme = resultColors[report.status];
                    return (
                      <div
                        key={report.programId}
                        className="p-6 rounded-2xl"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div className="flex flex-col lg:flex-row gap-4 justify-between mb-5">
                          <div>
                            <div className="text-xs font-semibold mb-1" style={{ color: color.text }}>
                              {report.program?.program.category ?? "우선 판정"}
                            </div>
                            <h3 className="text-lg font-bold" style={{ color: "#F8FAFC" }}>
                              {report.program?.program.name ?? report.programId}
                            </h3>
                            <p className="text-sm mt-2" style={{ color: "rgba(248,250,252,0.55)" }}>
                              {report.summary}
                            </p>
                          </div>
                          <div
                            className="h-fit px-3 py-2 rounded-xl text-sm font-bold"
                            style={{
                              background: statusTheme.bg,
                              border: `1px solid ${statusTheme.border}`,
                              color: statusTheme.text,
                            }}
                          >
                            {resultLabels[report.status]}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div
                            className="p-4 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <div className="text-xs font-semibold mb-3" style={{ color: "rgba(248,250,252,0.4)" }}>
                              근거 요약
                            </div>
                            <ul className="space-y-2">
                              {report.rationale.map((item) => (
                                <li key={item} className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.7)" }}>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div
                            className="p-4 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <div className="text-xs font-semibold mb-3" style={{ color: "rgba(248,250,252,0.4)" }}>
                              보완 항목
                            </div>
                            {report.missingItems.length > 0 ? (
                              <ul className="space-y-2">
                                {report.missingItems.map((item) => (
                                  <li key={item} className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.7)" }}>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-sm" style={{ color: "rgba(248,250,252,0.45)" }}>
                                현재 확인된 보완 항목이 없습니다.
                              </div>
                            )}
                          </div>
                          <div
                            className="p-4 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <div className="text-xs font-semibold mb-3" style={{ color: "rgba(248,250,252,0.4)" }}>
                              다음 행동
                            </div>
                            <ul className="space-y-2">
                              {report.nextActions.map((item) => (
                                <li key={item} className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.7)" }}>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <button
                    className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(248,250,252,0.7)",
                    }}
                    onClick={resetFlow}
                  >
                    <RefreshCw size={16} />
                    다시 검토
                  </button>
                  {selectedProgramIds.length > 0 && (
                    <Link href={`/apply?session=${sessionId}&subsidies=${selectedProgramIds.join(",")}`}>
                      <button
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          background: "linear-gradient(135deg, #10B981, #059669)",
                          color: "#fff",
                          boxShadow: "0 0 20px rgba(16,185,129,0.3)",
                        }}
                      >
                        신청서 초안 생성
                        <ArrowRight size={16} />
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

                <ConsultationForm
                  subsidyName={selectedProgramIds.length > 0 ? "판정 결과 기반 지원금" : undefined}
                  context={{
                    sessionId: sessionId ?? undefined,
                    interestedProgramIds: selectedProgramIds,
                    determinationStatuses,
                    missingItems,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer
        className="py-8"
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
