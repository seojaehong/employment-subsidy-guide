import { startTransition, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  ListChecks,
  ShieldAlert,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import type {
  BaseEligibilityAnswers,
  DeterminationResult,
  EligibilityQuestionRecord,
  FollowUpAnswers,
  OperationalProgram,
  RecommendationRecord,
} from "@shared/subsidy";
import {
  determinationStatusGuides as statusGuides,
  determinePrograms,
  getCommonEligibilityQuestions,
  getProgramFollowUpQuestions,
  recommendProgramIds,
} from "@shared/subsidy";
import Navigation from "@/components/Navigation";
import ConsultationForm from "@/components/ConsultationForm";
import { usePrograms } from "@/hooks/usePrograms";
import { categoryColors } from "@/lib/subsidyData";
import {
  createEligibilitySession as createEligibilitySessionRequest,
  determineEligibilitySession as determineEligibilitySessionRequest,
  fetchEligibilityConfig,
} from "@/lib/api";

type FlowStep = "common" | "followup" | "result";

interface SessionCreateResponse {
  session: {
    id: string;
    baseAnswers: BaseEligibilityAnswers;
    recommendations: RecommendationRecord[];
  };
  followUpQuestions: EligibilityQuestionRecord[];
}

const resultLabels = {
  eligible: "신청 가능",
  needs_followup: "조금 더 확인 필요",
  ineligible: "조건 다시 확인",
  manual_review: "추가 확인 필요",
} as const;

const resultHeadlines = {
  eligible: "현재 확인된 내용 기준으로는 신청 준비를 이어가셔도 괜찮아요.",
  needs_followup: "몇 가지 사항만 더 확인되면 더 안정적으로 준비를 이어갈 수 있어요.",
  ineligible: "지금 답변 기준으로는 바로 진행하기보다 조건을 한 번 더 살펴보는 편이 좋아요.",
  manual_review: "현재 답변만으로는 부족해서 몇 가지 내용을 더 확인해보면 좋아요.",
} as const;

const resultActionTitles = {
  eligible: "준비해두면 좋아요",
  needs_followup: "먼저 확인해보세요",
  ineligible: "다시 확인해보세요",
  manual_review: "추가로 확인해보면 좋은 항목",
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
  const { programs } = usePrograms({ deferRemote: true, deferMs: 1500 });
  const [flowStep, setFlowStep] = useState<FlowStep>("common");
  const [commonQuestions, setCommonQuestions] = useState<EligibilityQuestionRecord[]>(() => getCommonEligibilityQuestions());
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
    const loadConfig = async () => {
      try {
        const config = await fetchEligibilityConfig() as { config: { commonQuestions: EligibilityQuestionRecord[] } };
        setCommonQuestions(config.config.commonQuestions);
      } catch {
        setCommonQuestions(getCommonEligibilityQuestions());
      }
    };

    void loadConfig();
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
  const draftReadyReports = applicableReports.filter((report) => report.canGenerateDraft);

  const determinationStatuses = Object.fromEntries(
    reports.map((report) => [report.programId, report.status]),
  );

  const missingItems = Array.from(
    new Set(reports.flatMap((report) => report.missingItems)),
  );

  const statusCounts = reports.reduce(
    (acc, report) => {
      acc[report.status] += 1;
      return acc;
    },
    {
      eligible: 0,
      needs_followup: 0,
      ineligible: 0,
      manual_review: 0,
    } as Record<DeterminationResult["status"], number>,
  );

  const sortedReports = [...reports].sort((a, b) => {
    const priority = {
      eligible: 0,
      needs_followup: 1,
      manual_review: 2,
      ineligible: 3,
    } as const;

    return priority[a.status] - priority[b.status];
  });

  const summaryHeadline =
    statusCounts.eligible > 0
      ? "지금 바로 이어서 살펴볼 수 있는 제도가 있습니다"
      : statusCounts.needs_followup > 0
        ? "조금 더 확인하면 이어서 준비할 수 있는 제도가 있습니다"
        : statusCounts.manual_review > 0
          ? "현재 정보만으로는 부족해 조금 더 확인이 필요한 제도가 있습니다"
          : "지금 단계에서는 조건을 한 번 더 확인해보는 편이 좋습니다";

  const summaryGuide =
    statusCounts.eligible > 0
      ? "먼저 `신청 가능`과 `조금 더 확인 필요` 제도부터 보시고, 필요한 준비만 차근차근 이어가보세요."
      : statusCounts.needs_followup > 0
        ? "보완 항목부터 먼저 챙기면 다음 판단이 훨씬 쉬워집니다."
        : statusCounts.manual_review > 0
          ? "자동으로 정리하기 어려운 항목은 현재 운영 방식과 내부 규정을 함께 보며 정리해보시면 좋아요."
          : "지금 답변과 실제 운영 기준이 같은지 먼저 다시 맞춰보시면 다음 판단이 훨씬 분명해집니다.";

  const getEmptyActionCopy = (status: DeterminationResult["status"]) => {
    if (status === "eligible") {
      return "현재 기준으로는 별도 보완 없이 신청 준비를 차근차근 진행하셔도 괜찮아요.";
    }

    if (status === "needs_followup") {
      return "큰 보완 항목은 보이지 않지만, 신청 전 세부 기준은 한 번 더 점검해보시면 좋아요.";
    }

    if (status === "manual_review") {
      return "추가 확인이 필요한 부분은 실제 인력 현황과 내부 규정을 함께 보며 정리해보시면 좋아요.";
    }

    return "지금 답변과 실제 운영 기준이 같은지 한 번 더 확인해보시면 다음 판단에 도움이 돼요.";
  };

  const getEligibleWrapUp = (report: DeterminationResult) => {
    const firstAction = report.nextActions[0];
    if (firstAction) {
      return `현재 기준으로는 별도 보완 없이 준비를 이어가셔도 괜찮아요. ${firstAction}`;
    }

    return "현재 기준으로는 별도 보완 없이 준비를 이어가셔도 괜찮아요. 제출 시점과 준비 서류만 차근차근 확인해보세요.";
  };

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
  const hasFollowUpQuestions = followUpQuestions.length > 0;

  const programLookup = useMemo(() => {
    return new Map(programs.map((program) => [program.program.legacyId, program]));
  }, [programs]);

  const selectedProgramIds = applicableReports.map((report) => report.programId);
  const draftReadyProgramIds = draftReadyReports.map((report) => report.programId);

  const consultationProgramNames = useMemo(
    () =>
      Object.fromEntries(
        selectedProgramIds
          .map((programId) => {
            const name = programLookup.get(programId)?.program.name;
            return name ? ([programId, name] as const) : null;
          })
          .filter(Boolean) as Array<readonly [string, string]>,
      ),
    [programLookup, selectedProgramIds],
  );
  const preparePackageHref =
    draftReadyProgramIds.length > 0
      ? `/prepare?session=${encodeURIComponent(sessionId ?? "")}&subsidies=${encodeURIComponent(
          draftReadyProgramIds.join(","),
        )}`
      : null;

  const buildLocalSessionPayload = (baseAnswers: BaseEligibilityAnswers): SessionCreateResponse => {
    const recommendations = recommendProgramIds(baseAnswers);
    return {
      session: {
        id: `local-session-${Date.now()}`,
        baseAnswers,
        recommendations,
      },
      followUpQuestions: getProgramFollowUpQuestions().filter((question) =>
        recommendations.some((recommendation) => recommendation.programId === question.programId),
      ),
    };
  };

  const resolveProgramsFromRecommendations = (recommendations: RecommendationRecord[]) =>
    recommendations
      .map((recommendation) => programLookup.get(recommendation.programId) ?? null)
      .filter(Boolean) as OperationalProgram[];

  const buildResolvedReports = (
    programIds: string[],
    baseAnswers: BaseEligibilityAnswers,
    answers: FollowUpAnswers,
  ) =>
    determinePrograms(programIds, baseAnswers, answers).map((determination) => ({
      ...determination,
      program: programLookup.get(determination.programId) ?? null,
    }));

  const startRecommendation = async () => {
    if (!normalisedBaseAnswers) return;
    setLoading(true);
    setError(null);

    try {
      const localPayload = buildLocalSessionPayload(normalisedBaseAnswers);
      const localPrograms = resolveProgramsFromRecommendations(localPayload.session.recommendations);

      startTransition(() => {
        setSessionId(localPayload.session.id);
        setRecommendedPrograms(localPrograms);
        setFollowUpQuestions(localPayload.followUpQuestions);
      });

      if (localPayload.followUpQuestions.length === 0) {
        const nextReports = buildResolvedReports(
          localPrograms.map((program) => program.program.legacyId),
          normalisedBaseAnswers,
          {},
        );
        startTransition(() => {
          setReports(nextReports);
        });
        sessionStorage.setItem(
          "eligibility-session",
          JSON.stringify({
            session: {
              id: localPayload.session.id,
              baseAnswers: normalisedBaseAnswers,
            },
            reports: nextReports,
          }),
        );
        setFlowStep("result");
      } else {
        setFlowStep("followup");
      }

      createEligibilitySessionRequest(normalisedBaseAnswers)
        .then((response) => {
          const payload = response as SessionCreateResponse;
          const resolvedPrograms = resolveProgramsFromRecommendations(payload.session.recommendations);
          startTransition(() => {
            setSessionId(payload.session.id);
            setRecommendedPrograms(resolvedPrograms);
            setFollowUpQuestions(payload.followUpQuestions);
          });
        })
        .catch(() => {
          // Keep the optimistic local flow when the network path is slow or unavailable.
        });
    } catch (err) {
      setError(err instanceof Error ? err.message : "추천 결과를 생성하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const submitDetermination = async () => {
    if (!sessionId || !normalisedBaseAnswers) return;
    setLoading(true);
    setError(null);

    try {
      const nextReports = buildResolvedReports(
        recommendedPrograms.map((program) => program.program.legacyId),
        normalisedBaseAnswers,
        followUpAnswers,
      );
      startTransition(() => {
        setReports(nextReports);
      });
      const payload = {
        session: {
          id: sessionId,
          baseAnswers: normalisedBaseAnswers,
        },
        reports: nextReports,
      };
      sessionStorage.setItem("eligibility-session", JSON.stringify(payload));
      setFlowStep("result");

      if (!sessionId.startsWith("local-session")) {
        determineEligibilitySessionRequest(sessionId, followUpAnswers)
          .then((response) => {
            const resolvedReports = (response as { reports: DeterminationResult[] }).reports.map((determination) => ({
              ...determination,
              program: programLookup.get(determination.programId) ?? null,
            }));
            startTransition(() => {
              setReports(resolvedReports);
            });
            sessionStorage.setItem(
              "eligibility-session",
              JSON.stringify({
                session: {
                  id: sessionId,
                  baseAnswers: normalisedBaseAnswers,
                },
                reports: resolvedReports,
              }),
            );
          })
          .catch(() => {
            // Keep the optimistic local result when the network path is slow or unavailable.
          });
      }
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
            data-testid={`eligibility-option-${question.id}-${option.value}`}
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
              질문에 답하면 준비 방향을 안내해드려요
            </div>
            <h1 className="text-3xl font-black mb-3" style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}>
              고용장려금 자격 검토
            </h1>
            <p className="text-sm" style={{ color: "rgba(248,250,252,0.5)" }}>
              먼저 가능성이 있는 제도를 좁혀보고, 이어서 꼭 필요한 요건을 확인해 이해하기 쉬운 결과로 안내해드립니다.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {[
                "3분 안팎으로 1차 확인",
                "회원가입 없이 바로 진행",
                "보완 포인트까지 함께 안내",
              ].map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(248,250,252,0.62)",
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
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
                    <span>1단계 기본 확인 {commonStepIndex + 1} / {commonQuestions.length}</span>
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
                    data-testid="common-next-button"
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
                    {commonStepIndex === commonQuestions.length - 1 ? "가능한 지원금 살펴보기" : "다음"}
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
                      <span className="text-sm font-bold">살펴볼 지원금</span>
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
                        <span className="text-sm font-bold">2단계 추가 확인</span>
                      </div>
                      <h2 className="text-xl font-bold mb-2" style={{ color: "#F8FAFC" }}>
                        지원금별로 필요한 내용을 조금 더 확인할게요
                      </h2>
                      <p className="text-sm" style={{ color: "rgba(248,250,252,0.5)" }}>
                        아래 질문에 답해주시면 현재 준비 정도를 기준으로 `신청 가능`, `조금 더 확인 필요`, `조건 다시 확인`, `추가 확인 필요` 상태로 차분히 정리해드립니다.
                      </p>
                    </div>

                    {!hasFollowUpQuestions && (
                      <div
                        className="p-6 rounded-2xl text-sm"
                        style={{
                          background: "rgba(59,130,246,0.06)",
                          border: "1px solid rgba(59,130,246,0.15)",
                          color: "rgba(248,250,252,0.72)",
                        }}
                      >
                        추가로 확인할 질문이 많지 않은 제도입니다. 지금 바로 결과를 정리해보셔도 됩니다.
                      </div>
                    )}

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
                        data-testid="followup-back-button"
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
                        data-testid="followup-submit-button"
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold transition-all"
                        style={{
                          background: (!hasFollowUpQuestions || canSubmitFollowUp)
                            ? "linear-gradient(135deg, #10B981, #059669)"
                            : "rgba(255,255,255,0.05)",
                          color: (!hasFollowUpQuestions || canSubmitFollowUp) ? "#fff" : "rgba(248,250,252,0.3)",
                          boxShadow: (!hasFollowUpQuestions || canSubmitFollowUp) ? "0 0 20px rgba(16,185,129,0.3)" : "none",
                        }}
                        disabled={(hasFollowUpQuestions && !canSubmitFollowUp) || loading}
                        onClick={() => void submitDetermination()}
                      >
                        결과 확인하기
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
                <div
                  className="p-6 md:p-7 rounded-3xl mb-8"
                  style={{
                    background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(16,185,129,0.08))",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex flex-col lg:flex-row gap-6 lg:items-end lg:justify-between">
                    <div>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "#D1FAE5",
                        }}
                      >
                        <CheckCircle2 size={12} />
                        확인 완료
                      </div>
                      <h2
                        className="text-3xl font-black mb-3"
                        style={{ color: "#F8FAFC", letterSpacing: "-0.02em" }}
                      >
                        {summaryHeadline}
                      </h2>
                      <p className="text-sm max-w-2xl" style={{ color: "rgba(248,250,252,0.68)" }}>
                        결과를 한 번에 이해하실 수 있도록 현재 상태와 이유, 다음 준비 순서를 중심으로 정리했습니다.
                        {` ${summaryGuide}`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-full lg:min-w-[420px]">
                      {[
                        {
                          label: resultLabels.eligible,
                          value: statusCounts.eligible,
                          icon: <CheckCircle2 size={15} />,
                          color: resultColors.eligible,
                        },
                        {
                          label: resultLabels.needs_followup,
                          value: statusCounts.needs_followup,
                          icon: <ListChecks size={15} />,
                          color: resultColors.needs_followup,
                        },
                        {
                          label: resultLabels.manual_review,
                          value: statusCounts.manual_review,
                          icon: <ShieldAlert size={15} />,
                          color: resultColors.manual_review,
                        },
                        {
                          label: resultLabels.ineligible,
                          value: statusCounts.ineligible,
                          icon: <AlertTriangle size={15} />,
                          color: resultColors.ineligible,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="p-4 rounded-2xl"
                          style={{
                            background: item.color.bg,
                            border: `1px solid ${item.color.border}`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-3" style={{ color: item.color.text }}>
                            {item.icon}
                            <span className="text-xs font-semibold">{item.label}</span>
                          </div>
                          <div className="text-2xl font-black" style={{ color: "#F8FAFC" }}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {missingItems.length > 0 && (
                  <div
                    className="p-5 rounded-2xl mb-8"
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.18)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3" style={{ color: "#FCD34D" }}>
                      <Target size={16} />
                      <span className="text-sm font-bold">이번 결과에서 먼저 챙겨보면 좋은 포인트</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {missingItems.slice(0, 6).map((item) => (
                        <span
                          key={item}
                          className="px-3 py-1.5 rounded-full text-xs font-medium"
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

                <div
                  className="p-5 rounded-2xl mb-8"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3" style={{ color: "#C4B5FD" }}>
                    <ShieldCheck size={16} />
                    <span className="text-sm font-bold">상태는 이렇게 해석해요</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(Object.keys(statusGuides) as Array<keyof typeof statusGuides>).map((status) => (
                      <div
                        key={status}
                        className="p-4 rounded-xl"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: `1px solid ${resultColors[status].border}`,
                        }}
                      >
                        <div className="text-xs font-semibold mb-2" style={{ color: resultColors[status].text }}>
                          {statusGuides[status].label}
                        </div>
                        <div className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.72)" }}>
                          {statusGuides[status].description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {sortedReports.map((report) => {
                    const color = report.program
                      ? categoryColors[report.program.program.category]
                      : { text: "#93C5FD", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.18)" };
                    const statusTheme = resultColors[report.status];
                    const actionItems = report.missingItems.length > 0 ? report.missingItems : report.nextActions;
                    const isSimpleEligible = report.status === "eligible" && report.missingItems.length === 0;
                    return (
                      <div
                        key={report.programId}
                        className="p-6 rounded-3xl"
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
                            <p className="text-sm mt-2" style={{ color: "rgba(248,250,252,0.72)" }}>
                              {resultHeadlines[report.status]}
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

                        <div
                          className="p-4 rounded-2xl mb-4"
                          style={{
                            background: color.bg,
                            border: `1px solid ${color.border}`,
                          }}
                        >
                          <div className="text-xs font-semibold mb-2" style={{ color: color.text }}>
                            지금 상태 한눈에 보기
                          </div>
                          <div className="text-sm leading-relaxed" style={{ color: "#E2E8F0" }}>
                            {report.summary}
                          </div>
                        </div>

                        {isSimpleEligible ? (
                          <div
                            className="p-4 rounded-2xl"
                            style={{
                              background: "rgba(16,185,129,0.08)",
                              border: "1px solid rgba(16,185,129,0.18)",
                            }}
                          >
                            <div className="text-xs font-semibold mb-2" style={{ color: "#6EE7B7" }}>
                              지금 기준으로는
                            </div>
                            <div className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.78)" }}>
                              {getEligibleWrapUp(report)}
                            </div>
                          </div>
                        ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div
                            className="p-4 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <div className="text-xs font-semibold mb-3" style={{ color: "rgba(248,250,252,0.4)" }}>
                              확인된 내용이에요
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
                              {resultActionTitles[report.status]}
                            </div>
                            {actionItems.length > 0 ? (
                              <ul className="space-y-2">
                                {actionItems.map((item) => (
                                  <li key={item} className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.7)" }}>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-sm" style={{ color: "rgba(248,250,252,0.45)" }}>
                                {getEmptyActionCopy(report.status)}
                              </div>
                            )}
                          </div>
                          <div
                            className="p-4 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            <div className="text-xs font-semibold mb-3" style={{ color: "rgba(248,250,252,0.4)" }}>
                              다음 순서예요
                            </div>
                            {report.nextActions.length > 0 ? (
                              <ul className="space-y-2">
                                {report.nextActions.map((item) => (
                                  <li key={item} className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.7)" }}>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.45)" }}>
                                지금 결과를 기준으로 제출 시점과 준비 서류만 차근차근 확인해보세요.
                              </div>
                            )}
                          </div>
                        </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {preparePackageHref ? (
                  <div
                    className="p-6 rounded-3xl mb-8"
                    style={{
                      background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(14,165,233,0.08))",
                      border: "1px solid rgba(59,130,246,0.18)",
                    }}
                  >
                    <div className="flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 text-xs font-semibold mb-3" style={{ color: "#93C5FD" }}>
                          <ClipboardList size={12} />
                          준비 패키지로 이어서 정리할 수 있어요
                        </div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: "#F8FAFC" }}>
                          현재 결과를 바탕으로 준비용 초안과 확인 항목을 바로 정리해보세요.
                        </h3>
                        <p className="text-sm max-w-2xl" style={{ color: "rgba(248,250,252,0.68)" }}>
                          신청 가능하거나 조금 더 확인이 필요한 제도는 준비 패키지로 이어서 볼 수 있습니다. 공식 제출용 서식은 아니지만, 사업장 정보와 현재 결과를 묶어 PDF로 정리하기에 충분한 수준이에요.
                        </p>
                      </div>
                      <Link href={preparePackageHref}>
                        <button
                          data-testid="result-open-prepare-package-button"
                          className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold transition-all"
                          style={{
                            background: "linear-gradient(135deg, #0EA5E9, #2563EB)",
                            color: "#fff",
                            boxShadow: "0 0 20px rgba(14,165,233,0.24)",
                          }}
                        >
                          준비 패키지 열기
                          <ArrowRight size={16} />
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div
                    className="p-6 rounded-3xl mb-8"
                    style={{
                      background: "rgba(245,158,11,0.08)",
                      border: "1px solid rgba(245,158,11,0.18)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3" style={{ color: "#FCD34D" }}>
                      <ShieldAlert size={16} />
                      <span className="text-sm font-bold">이 경우에는 상담으로 이어보는 편이 더 정확해요</span>
                    </div>
                    <div className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.72)" }}>
                      현재 결과는 자동으로 준비 패키지를 만들기보다 실제 운영 방식과 자료를 함께 보며 정리하는 편이 더 안전합니다.
                      아래 상담 요청에 현재 결과가 함께 전달되니, 우선순위와 다음 순서를 같이 정리받으시면 좋아요.
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <button
                    data-testid="result-reset-button"
                    className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(248,250,252,0.7)",
                    }}
                    onClick={resetFlow}
                  >
                    <RefreshCw size={16} />
                    답변 조정하고 다시 보기
                  </button>
                  <Link href="/subsidies">
                    <button
                      data-testid="result-view-subsidies-button"
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                        color: "#fff",
                        boxShadow: "0 0 20px rgba(59,130,246,0.3)",
                      }}
                    >
                      다른 지원금 함께 살펴보기
                      <ArrowRight size={16} />
                    </button>
                  </Link>
                </div>

                <ConsultationForm
                  subsidyName={selectedProgramIds.length > 0 ? "판정 결과 기반 지원금" : undefined}
                  programNames={consultationProgramNames}
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
          이 결과는 빠른 1차 확인용 안내입니다. 실제 신청 전에는 최신 기준과 제출 서류를 한 번 더 확인해보시는 걸 권해드립니다.
        </div>
      </footer>
    </div>
  );
}
