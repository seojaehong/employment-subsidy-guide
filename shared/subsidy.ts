export type CompanySize = "우선지원대상기업" | "중견기업" | "대규모기업";

export type SubsidyCategory =
  | "고용창출장려금"
  | "고용안정장려금"
  | "고용유지지원금"
  | "청년고용장려금"
  | "장년고용장려금"
  | "고용환경개선장려금"
  | "장애인고용"
  | "지역고용촉진지원금"
  | "정규직전환지원";

export type WorkforceRange = "under5" | "5to29" | "30to99" | "over100";
export type LocationType = "metropolitan" | "nonMetropolitan";

export type SituationTag =
  | "newHire"
  | "workLifeBalance"
  | "parentalLeave"
  | "youthHire"
  | "elderlyHire"
  | "disabilityHire"
  | "regularConversion"
  | "employmentMaintenance"
  | "regionalExpansion";

export type DeterminationStatus =
  | "eligible"
  | "needs_followup"
  | "ineligible"
  | "manual_review";

export interface SubsidyAmount {
  우선지원대상기업?: string;
  중견기업?: string;
  대규모기업?: string;
  공통?: string;
}

export interface SubsidyItem {
  id: string;
  category: SubsidyCategory;
  name: string;
  subName?: string;
  description: string;
  requirements: string[];
  amount: SubsidyAmount;
  amountLabel: string;
  duration: string;
  applicationCycle: string;
  exclusions: string[];
  notes: string[];
  tags: string[];
  highlight?: boolean;
}

export interface SourceDocumentRecord {
  id: string;
  title: string;
  issuer: string;
  기준일: string;
  publishedAt: string;
  fileName: string;
  priority: number;
}

export interface SubsidyProgramRecord {
  id: string;
  legacyId: string;
  name: string;
  subName?: string;
  category: SubsidyCategory;
  summary: string;
  amountLabel: string;
  duration: string;
  applicationCycle: string;
  tags: string[];
  highlight?: boolean;
  baseAmount: SubsidyAmount;
  sourceDocumentIds: string[];
  latestSourceDocumentId: string;
  overrideAmountLabel?: string;
  overrideSummary?: string;
  published: boolean;
}

export interface SubsidyRuleRecord {
  id: string;
  programId: string;
  requirements: string[];
  exclusions: string[];
  notes: string[];
  followUpQuestionIds: string[];
}

export interface SubsidyExclusionRecord {
  id: string;
  programId: string;
  text: string;
}

export interface EligibilityQuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface EligibilityQuestionRecord {
  id: string;
  scope: "common" | "program";
  programId?: string;
  prompt: string;
  helper?: string;
  type: "single" | "multi";
  options: EligibilityQuestionOption[];
}

export interface BaseEligibilityAnswers {
  companySize: CompanySize;
  workforceRange: WorkforceRange;
  locationType: LocationType;
  situations: SituationTag[];
}

export type FollowUpAnswers = Record<string, string | string[]>;

export interface RecommendationRecord {
  programId: string;
  reason: string;
  matchScore: number;
}

export interface DeterminationResult {
  programId: string;
  status: DeterminationStatus;
  summary: string;
  rationale: string[];
  missingItems: string[];
  nextActions: string[];
  canGenerateDraft: boolean;
}

export interface EligibilitySessionRecord {
  id: string;
  createdAt: string;
  baseAnswers: BaseEligibilityAnswers;
  recommendations: RecommendationRecord[];
  followUpAnswers: FollowUpAnswers;
  determinations: DeterminationResult[];
}

export interface ConsultationLeadRecord {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  company?: string;
  consultType: string;
  message?: string;
  subsidyName?: string;
  sessionId?: string;
  interestedProgramIds: string[];
  determinationStatuses: Record<string, DeterminationStatus>;
  missingItems: string[];
}

export interface EligibilityConfig {
  commonQuestions: EligibilityQuestionRecord[];
  priorityProgramIds: string[];
}

export interface OperationalProgram {
  program: SubsidyProgramRecord;
  rule: SubsidyRuleRecord;
  exclusions: SubsidyExclusionRecord[];
  latestSource: SourceDocumentRecord;
}

export type DraftStatus = "draft" | "in_review" | "published";
export type PublishStatus = "draft" | "review" | "published";
export type AdminRole = "editor" | "publisher";
export type RuleOperator = "equals" | "not_equals" | "includes" | "not_includes";
export type RuleType = "recommendation" | "determination";

export interface RuleDefinition {
  id: string;
  documentVersionId?: string | null;
  targetProgramId: string;
  ruleType: RuleType;
  inputKey: string;
  operator: RuleOperator;
  expectedValue: string;
  effectStatus?: DeterminationStatus;
  effectSummary?: string;
  effectMissingItem?: string;
  effectRationale?: string;
  effectNextAction?: string;
  effectReason?: string;
  effectMatchScore?: number;
  priority: number;
  published: boolean;
  draftStatus: DraftStatus;
}

export interface QuestionSetVersion {
  id: string;
  documentVersionId?: string | null;
  questionId: string;
  scope: "common" | "program";
  programId?: string;
  prompt: string;
  helper?: string;
  type: "single" | "multi";
  options: EligibilityQuestionOption[];
  published: boolean;
  draftStatus: DraftStatus;
}

export interface DocumentVersionRecord {
  id: string;
  slug: string;
  title: string;
  issuer: string;
  baseDate: string;
  fileName: string;
  status: PublishStatus;
  sourceDocumentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramDraftRecord {
  id: string;
  documentVersionId: string;
  legacyId: string;
  name: string;
  subName?: string;
  category: SubsidyCategory;
  summary: string;
  amountLabel: string;
  duration: string;
  applicationCycle: string;
  tags: string[];
  highlight?: boolean;
  baseAmount: SubsidyAmount;
  requirements: string[];
  exclusions: string[];
  notes: string[];
  followUpQuestionIds: string[];
  latestSourceDocumentId: string;
  sourceDocumentIds: string[];
  draftStatus: DraftStatus;
}

export interface OverrideRecord {
  id: string;
  documentVersionId?: string | null;
  targetType: string;
  targetId: string;
  fieldName: string;
  value: string;
  reason: string;
  authorEmail: string;
  effectiveFrom: string;
  createdAt: string;
}

export interface AdminSession {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  email: string;
  role?: AdminRole;
  bootstrapNeeded?: boolean;
}

const RECOMMENDATION_TARGETS = new Set([
  "employment-promotion",
  "youth-employment",
  "continued-employment",
  "regional-employment",
  "regular-conversion",
]);

export function isPriorityProgram(programId: string) {
  return RECOMMENDATION_TARGETS.has(programId);
}

export function getProgramDisplayAmount(program: SubsidyProgramRecord) {
  return program.overrideAmountLabel ?? program.amountLabel;
}

export function getProgramDisplaySummary(program: SubsidyProgramRecord) {
  return program.overrideSummary ?? program.summary;
}

export function getCommonEligibilityQuestions(): EligibilityQuestionRecord[] {
  return [
    {
      id: "companySize",
      scope: "common",
      prompt: "기업 규모를 선택해주세요",
      helper: "고용보험 피보험자 수 기준",
      type: "single",
      options: [
        { value: "우선지원대상기업", label: "우선지원대상기업" },
        { value: "중견기업", label: "중견기업" },
        { value: "대규모기업", label: "대규모기업" },
      ],
    },
    {
      id: "situations",
      scope: "common",
      prompt: "해당되는 상황을 모두 선택해주세요",
      type: "multi",
      options: [
        { value: "newHire", label: "취약계층 신규 채용" },
        { value: "youthHire", label: "청년 정규직 채용" },
        { value: "elderlyHire", label: "고령자 계속고용 또는 고용 확대" },
        { value: "regularConversion", label: "비정규직 정규직 전환" },
        { value: "regionalExpansion", label: "고용위기지역 이전·신설·증설" },
        { value: "workLifeBalance", label: "근무혁신·유연근무 도입" },
        { value: "parentalLeave", label: "출산·육아휴직 제도 운영" },
        { value: "employmentMaintenance", label: "경영위기 대응 고용유지" },
      ],
    },
    {
      id: "workforceRange",
      scope: "common",
      prompt: "상시 근로자 수 구간을 알려주세요",
      helper: "정규직 전환 지원금은 5인 이상 30인 미만 요건이 중요합니다.",
      type: "single",
      options: [
        { value: "under5", label: "5인 미만" },
        { value: "5to29", label: "5인 이상 30인 미만" },
        { value: "30to99", label: "30인 이상 100인 미만" },
        { value: "over100", label: "100인 이상" },
      ],
    },
    {
      id: "locationType",
      scope: "common",
      prompt: "사업장 소재지를 선택해주세요",
      helper: "고령자 계속고용장려금과 지역고용촉진지원금 판정에 사용됩니다.",
      type: "single",
      options: [
        { value: "metropolitan", label: "수도권" },
        { value: "nonMetropolitan", label: "비수도권" },
      ],
    },
  ];
}

export function getProgramFollowUpQuestions(): EligibilityQuestionRecord[] {
  return [
    {
      id: "employment-promotion.jobSeekerRegistration",
      scope: "program",
      programId: "employment-promotion",
      prompt: "채용 대상자가 사전 구직등록 또는 취업지원 이력이 있나요?",
      helper: "고용촉진장려금 핵심 선행요건입니다.",
      type: "single",
      options: [
        { value: "yes", label: "예, 확인 가능" },
        { value: "unknown", label: "아직 확인 전" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "employment-promotion.regularEmployment",
      scope: "program",
      programId: "employment-promotion",
      prompt: "정규직 또는 기간의 정함이 없는 형태로 채용할 예정인가요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "employment-promotion.maintainSixMonths",
      scope: "program",
      programId: "employment-promotion",
      prompt: "채용 후 6개월 이상 고용 유지가 가능하신가요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "unknown", label: "운영 계획 확인 필요" },
        { value: "no", label: "어려움" },
      ],
    },
    {
      id: "employment-promotion.wageLevel",
      scope: "program",
      programId: "employment-promotion",
      prompt: "예정 월평균 보수가 124만원 이상인가요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "unknown", label: "산정 전" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "youth-employment.targetYouth",
      scope: "program",
      programId: "youth-employment",
      prompt: "채용 대상 청년이 취업애로청년 기준에 해당하나요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "unknown", label: "확인 필요" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "youth-employment.regularEmployment",
      scope: "program",
      programId: "youth-employment",
      prompt: "청년을 정규직으로 채용하고 고용보험 가입 예정인가요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "youth-employment.hours",
      scope: "program",
      programId: "youth-employment",
      prompt: "주 소정근로시간이 28시간 이상인가요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "unknown", label: "설계 중" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "youth-employment.maintainSixMonths",
      scope: "program",
      programId: "youth-employment",
      prompt: "채용 후 6개월 이상 고용 유지가 가능하신가요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "unknown", label: "운영 계획 확인 필요" },
        { value: "no", label: "어려움" },
      ],
    },
    {
      id: "continued-employment.retirementPolicy",
      scope: "program",
      programId: "continued-employment",
      prompt: "사업장에서 정년제도를 1년 이상 운영했나요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "unknown", label: "규정 확인 필요" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "continued-employment.formalPolicy",
      scope: "program",
      programId: "continued-employment",
      prompt: "취업규칙 또는 단체협약에 계속고용제도를 명시했나요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "needs_update", label: "개정 예정" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "continued-employment.ratioCheck",
      scope: "program",
      programId: "continued-employment",
      prompt: "직전 연도 60세 이상 피보험자 비율이 30% 이하인가요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "unknown", label: "집계 필요" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "continued-employment.targetWorker",
      scope: "program",
      programId: "continued-employment",
      prompt: "정년 도달 근로자를 실제로 계속고용 또는 재고용할 계획인가요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "planned", label: "대상자 확정 전" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "regional-employment.planReported",
      scope: "program",
      programId: "regional-employment",
      prompt: "지역고용계획을 신고했거나 신고할 수 있나요?",
      helper: "지역고용촉진지원금 핵심 선행절차입니다.",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "needs_report", label: "아직 미신고, 준비 가능" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "regional-employment.projectType",
      scope: "program",
      programId: "regional-employment",
      prompt: "고용위기지역으로 이전·신설·증설 중 어떤 형태인가요?",
      type: "single",
      options: [
        { value: "qualified", label: "이전·신설·증설에 해당" },
        { value: "unknown", label: "판단 필요" },
        { value: "no", label: "해당 없음" },
      ],
    },
    {
      id: "regional-employment.localResident",
      scope: "program",
      programId: "regional-employment",
      prompt: "채용 대상자가 해당 지역에 3개월 이상 거주한 구직자인가요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "unknown", label: "확인 필요" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "regional-employment.maintainSixMonths",
      scope: "program",
      programId: "regional-employment",
      prompt: "채용 후 6개월 이상 고용 유지가 가능하신가요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "unknown", label: "운영 계획 확인 필요" },
        { value: "no", label: "어려움" },
      ],
    },
    {
      id: "regular-conversion.tenureSixMonths",
      scope: "program",
      programId: "regular-conversion",
      prompt: "전환 대상자가 현재 6개월 이상 근속했나요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "unknown", label: "근속기간 확인 필요" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "regular-conversion.formalConversion",
      scope: "program",
      programId: "regular-conversion",
      prompt: "정규직 전환 또는 직접고용으로 처리할 계획인가요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "planned", label: "검토 중" },
        { value: "no", label: "아니오" },
      ],
    },
    {
      id: "regular-conversion.maintainOneMonth",
      scope: "program",
      programId: "regular-conversion",
      prompt: "전환 후 1개월 이상 고용 유지가 가능하신가요?",
      type: "single",
      options: [
        { value: "yes", label: "예" },
        { value: "unknown", label: "운영 계획 확인 필요" },
        { value: "no", label: "어려움" },
      ],
    },
    {
      id: "regular-conversion.wageIncrease",
      scope: "program",
      programId: "regular-conversion",
      prompt: "전환 후 월평균 임금이 20만원 이상 증가하나요?",
      type: "single",
      options: [
        { value: "yes", label: "예, 60만원 구간 검토" },
        { value: "unknown", label: "산정 필요" },
        { value: "no", label: "아니오, 40만원 구간 검토" },
      ],
    },
  ];
}

export function getEligibilityConfig(): EligibilityConfig {
  return {
    commonQuestions: getCommonEligibilityQuestions(),
    priorityProgramIds: Array.from(RECOMMENDATION_TARGETS),
  };
}

export function recommendProgramIds(baseAnswers: BaseEligibilityAnswers) {
  const recommendations: RecommendationRecord[] = [];
  const { situations, workforceRange } = baseAnswers;

  const push = (programId: string, reason: string, matchScore: number) => {
    if (!isPriorityProgram(programId)) return;
    recommendations.push({ programId, reason, matchScore });
  };

  if (situations.includes("newHire")) {
    push("employment-promotion", "취약계층 신규채용 계획이 있어 고용촉진장려금 검토가 필요합니다.", 92);
  }
  if (situations.includes("youthHire")) {
    push("youth-employment", "청년 정규직 채용 계획이 있어 청년일자리도약장려금이 우선 후보입니다.", 94);
  }
  if (situations.includes("elderlyHire")) {
    push("continued-employment", "고령자 계속고용 또는 재고용 계획이 있어 계속고용장려금을 검토합니다.", 90);
  }
  if (situations.includes("regionalExpansion")) {
    push("regional-employment", "고용위기지역 이전·신설·증설 상황이라 지역고용촉진지원금을 검토합니다.", 91);
  }
  if (situations.includes("regularConversion")) {
    const baseReason =
      workforceRange === "5to29"
        ? "30인 미만 구간이라 정규직 전환 지원금 핵심 요건에 근접합니다."
        : "정규직 전환 계획이 있지만 인원 구간 요건을 함께 확인해야 합니다.";
    push("regular-conversion", baseReason, workforceRange === "5to29" ? 96 : 82);
  }

  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}

function getFollowValue(answers: FollowUpAnswers, key: string) {
  return answers[key];
}

export function determineProgram(
  programId: string,
  baseAnswers: BaseEligibilityAnswers,
  followUpAnswers: FollowUpAnswers,
) : DeterminationResult {
  switch (programId) {
    case "employment-promotion":
      return determineEmploymentPromotion(baseAnswers, followUpAnswers);
    case "youth-employment":
      return determineYouthEmployment(baseAnswers, followUpAnswers);
    case "continued-employment":
      return determineContinuedEmployment(baseAnswers, followUpAnswers);
    case "regional-employment":
      return determineRegionalEmployment(baseAnswers, followUpAnswers);
    case "regular-conversion":
      return determineRegularConversion(baseAnswers, followUpAnswers);
    default:
      return {
        programId,
        status: "manual_review",
        summary: "이 프로그램은 수동 검토가 필요합니다.",
        rationale: ["1차 판정 엔진 대상 제도가 아니어서 상담 검토가 필요합니다."],
        missingItems: [],
        nextActions: ["전문가 상담으로 개별 요건을 확인하세요."],
        canGenerateDraft: false,
      };
  }
}

export function determinePrograms(
  programIds: string[],
  baseAnswers: BaseEligibilityAnswers,
  followUpAnswers: FollowUpAnswers,
) {
  return programIds.map((programId) => determineProgram(programId, baseAnswers, followUpAnswers));
}

function determineEmploymentPromotion(
  baseAnswers: BaseEligibilityAnswers,
  answers: FollowUpAnswers,
): DeterminationResult {
  const rationale = [
    `${baseAnswers.companySize} 기준 금액 구간으로 검토했습니다.`,
    "취약계층 신규채용 상황이 선택되어 우선 추천 대상으로 분류됐습니다.",
  ];
  const missingItems: string[] = [];

  const registration = getFollowValue(answers, "employment-promotion.jobSeekerRegistration");
  const regularEmployment = getFollowValue(answers, "employment-promotion.regularEmployment");
  const maintain = getFollowValue(answers, "employment-promotion.maintainSixMonths");
  const wage = getFollowValue(answers, "employment-promotion.wageLevel");

  if (registration === "no" || regularEmployment === "no" || wage === "no") {
    return {
      programId: "employment-promotion",
      status: "ineligible",
      summary: "핵심 선행요건이 부족해 현재는 신청 가능성이 낮습니다.",
      rationale: [
        "구직등록 이력, 정규직 채용 형태, 월평균 보수 기준 중 하나 이상이 충족되지 않았습니다.",
      ],
      missingItems: ["사전 구직등록 또는 취업지원 이력", "정규직 채용 형태", "월평균 보수 124만원 이상"],
      nextActions: ["채용 대상자 선행요건과 임금수준을 다시 설계한 뒤 재검토하세요."],
      canGenerateDraft: false,
    };
  }

  if (registration === "unknown") missingItems.push("채용 대상자의 구직등록 또는 취업지원 이력 확인");
  if (maintain === "unknown") missingItems.push("6개월 고용유지 운영계획 확정");
  if (wage === "unknown") missingItems.push("월평균 보수 산정");
  if (maintain === "no") missingItems.push("6개월 이상 고용유지 계획");

  const status: DeterminationStatus =
    maintain === "no" ? "manual_review" : missingItems.length > 0 ? "needs_followup" : "eligible";

  return {
    programId: "employment-promotion",
    status,
    summary:
      status === "eligible"
        ? "고용촉진장려금 신청 가능성이 높습니다."
        : "핵심 구조는 맞지만 일부 요건 확인 또는 보완이 필요합니다.",
    rationale,
    missingItems,
    nextActions: [
      "채용 대상자 선행요건 증빙을 확보하세요.",
      "고용 후 6개월 유지 계획과 임금 기준을 점검하세요.",
    ],
    canGenerateDraft: status === "eligible" || status === "needs_followup",
  };
}

function determineYouthEmployment(
  baseAnswers: BaseEligibilityAnswers,
  answers: FollowUpAnswers,
): DeterminationResult {
  const rationale = [
    "청년 정규직 채용 상황을 기준으로 청년일자리도약장려금을 판정했습니다.",
  ];
  const missingItems: string[] = [];
  const targetYouth = getFollowValue(answers, "youth-employment.targetYouth");
  const regularEmployment = getFollowValue(answers, "youth-employment.regularEmployment");
  const hours = getFollowValue(answers, "youth-employment.hours");
  const maintain = getFollowValue(answers, "youth-employment.maintainSixMonths");

  if (regularEmployment === "no" || hours === "no" || maintain === "no") {
    return {
      programId: "youth-employment",
      status: "ineligible",
      summary: "청년일자리도약장려금 핵심 채용요건이 충족되지 않습니다.",
      rationale: [
        "정규직 채용, 주 28시간 이상, 6개월 유지 중 하나 이상이 충족되지 않았습니다.",
      ],
      missingItems: ["정규직 채용", "주 28시간 이상 근로", "6개월 이상 고용유지"],
      nextActions: ["채용 조건을 재설계한 뒤 다시 판정하세요."],
      canGenerateDraft: false,
    };
  }

  if (targetYouth === "unknown") missingItems.push("취업애로청년 해당 여부 확인");
  if (hours === "unknown") missingItems.push("주 소정근로시간 설계 확정");
  if (maintain === "unknown") missingItems.push("6개월 고용유지 계획 확정");
  if (baseAnswers.companySize === "대규모기업") {
    missingItems.push("대규모기업은 원칙적으로 대상이 아니므로 별도 확인");
  }

  const status: DeterminationStatus =
    baseAnswers.companySize === "대규모기업"
      ? "manual_review"
      : missingItems.length > 0
        ? "needs_followup"
        : "eligible";

  rationale.push(
    baseAnswers.companySize === "중견기업"
      ? "중견기업은 비수도권 산업단지 입주 여부를 추가 확인해야 합니다."
      : `${baseAnswers.companySize} 기준으로 우선 검토했습니다.`,
  );

  return {
    programId: "youth-employment",
    status,
    summary:
      status === "eligible"
        ? "청년일자리도약장려금 신청 가능성이 높습니다."
        : "채용유형은 적합하지만 일부 세부요건을 더 확인해야 합니다.",
    rationale,
    missingItems,
    nextActions: [
      "청년 취업애로 기준과 산업단지 입주 여부를 확인하세요.",
      "참여신청 승인 후 6개월 유지 요건을 맞춰 신청하세요.",
    ],
    canGenerateDraft: status === "eligible" || status === "needs_followup",
  };
}

function determineContinuedEmployment(
  baseAnswers: BaseEligibilityAnswers,
  answers: FollowUpAnswers,
): DeterminationResult {
  const rationale = [
    baseAnswers.locationType === "nonMetropolitan"
      ? "비수도권 사업장으로 분기 120만원 구간을 우선 적용합니다."
      : "수도권 사업장으로 분기 90만원 구간을 우선 적용합니다.",
  ];
  const missingItems: string[] = [];

  const retirementPolicy = getFollowValue(answers, "continued-employment.retirementPolicy");
  const formalPolicy = getFollowValue(answers, "continued-employment.formalPolicy");
  const ratioCheck = getFollowValue(answers, "continued-employment.ratioCheck");
  const targetWorker = getFollowValue(answers, "continued-employment.targetWorker");

  if (retirementPolicy === "no" || formalPolicy === "no" || ratioCheck === "no" || targetWorker === "no") {
    return {
      programId: "continued-employment",
      status: "ineligible",
      summary: "계속고용장려금 필수 제도요건이 부족합니다.",
      rationale: [
        "정년제도 운영, 계속고용 규정 명시, 60세 이상 비율, 대상자 계속고용 계획 중 일부가 충족되지 않았습니다.",
      ],
      missingItems: ["정년제도 운영", "취업규칙·단체협약 개정", "60세 이상 비율 요건", "계속고용 대상자 확정"],
      nextActions: ["취업규칙과 인력구성 데이터를 점검한 뒤 재검토하세요."],
      canGenerateDraft: false,
    };
  }

  if (retirementPolicy === "unknown") missingItems.push("정년제도 운영기간 확인");
  if (formalPolicy === "needs_update") missingItems.push("취업규칙 또는 단체협약 개정");
  if (ratioCheck === "unknown") missingItems.push("직전 연도 60세 이상 피보험자 비율 산정");
  if (targetWorker === "planned") missingItems.push("정년 도달 근로자 대상자 확정");

  const status: DeterminationStatus = missingItems.length > 0 ? "needs_followup" : "eligible";

  return {
    programId: "continued-employment",
    status,
    summary:
      status === "eligible"
        ? "고령자 계속고용장려금 신청 가능성이 높습니다."
        : "제도 방향은 맞지만 규정과 대상자 확인을 먼저 마쳐야 합니다.",
    rationale,
    missingItems,
    nextActions: [
      "취업규칙·단체협약 개정 여부를 확정하세요.",
      baseAnswers.locationType === "nonMetropolitan"
        ? "비수도권 가산 구간을 적용할 증빙을 준비하세요."
        : "수도권 기준 금액으로 분기별 신청 계획을 세우세요.",
    ],
    canGenerateDraft: true,
  };
}

function determineRegionalEmployment(
  _baseAnswers: BaseEligibilityAnswers,
  answers: FollowUpAnswers,
): DeterminationResult {
  const missingItems: string[] = [];
  const planReported = getFollowValue(answers, "regional-employment.planReported");
  const projectType = getFollowValue(answers, "regional-employment.projectType");
  const localResident = getFollowValue(answers, "regional-employment.localResident");
  const maintain = getFollowValue(answers, "regional-employment.maintainSixMonths");

  if (planReported === "no" || projectType === "no" || localResident === "no" || maintain === "no") {
    return {
      programId: "regional-employment",
      status: "ineligible",
      summary: "지역고용촉진지원금 핵심 요건이 충족되지 않습니다.",
      rationale: [
        "지역고용계획 신고, 사업 유형, 지역 거주자 채용, 6개월 유지 중 하나 이상이 불충분합니다.",
      ],
      missingItems: ["지역고용계획 신고", "이전·신설·증설 인정", "지역 거주 구직자 채용", "6개월 고용유지"],
      nextActions: ["사업 이전·증설 구조와 계획신고 절차를 먼저 정리하세요."],
      canGenerateDraft: false,
    };
  }

  if (planReported === "needs_report") missingItems.push("지역고용계획 신고 선행");
  if (projectType === "unknown") missingItems.push("이전·신설·증설 인정 여부 검토");
  if (localResident === "unknown") missingItems.push("채용 대상자의 지역 거주기간 확인");
  if (maintain === "unknown") missingItems.push("6개월 고용유지 계획 확정");

  const status: DeterminationStatus =
    planReported === "needs_report"
      ? "needs_followup"
      : missingItems.length > 0
        ? "manual_review"
        : "eligible";

  return {
    programId: "regional-employment",
    status,
    summary:
      status === "eligible"
        ? "지역고용촉진지원금 신청 가능성이 높습니다."
        : "사업 구조는 맞지만 신고·거주요건 등 선행 검토가 필요합니다.",
    rationale: ["지역고용계획 신고와 지역 거주자 채용이 핵심 선행요건입니다."],
    missingItems,
    nextActions: [
      "조업 시작 전후 일정에 맞춰 지역고용계획 신고 여부를 확정하세요.",
      "채용 대상자 거주기간과 고용유지 계획을 증빙 형태로 정리하세요.",
    ],
    canGenerateDraft: status === "eligible" || status === "needs_followup",
  };
}

function determineRegularConversion(
  baseAnswers: BaseEligibilityAnswers,
  answers: FollowUpAnswers,
): DeterminationResult {
  const missingItems: string[] = [];
  const tenure = getFollowValue(answers, "regular-conversion.tenureSixMonths");
  const conversion = getFollowValue(answers, "regular-conversion.formalConversion");
  const maintain = getFollowValue(answers, "regular-conversion.maintainOneMonth");
  const wageIncrease = getFollowValue(answers, "regular-conversion.wageIncrease");

  if (baseAnswers.workforceRange !== "5to29") {
    return {
      programId: "regular-conversion",
      status: "ineligible",
      summary: "정규직 전환 지원금은 5인 이상 30인 미만 기업 요건이 핵심입니다.",
      rationale: ["공통 질문에서 입력한 상시 근로자 수 구간이 지원 대상 범위를 벗어났습니다."],
      missingItems: ["5인 이상 30인 미만 기업 요건"],
      nextActions: ["근로자 수 기준을 다시 확인하거나 다른 제도를 검토하세요."],
      canGenerateDraft: false,
    };
  }

  if (tenure === "no" || conversion === "no" || maintain === "no") {
    return {
      programId: "regular-conversion",
      status: "ineligible",
      summary: "전환 대상자 또는 고용유지 요건이 부족합니다.",
      rationale: ["6개월 근속, 정규직 전환, 전환 후 1개월 유지 요건 중 일부가 충족되지 않았습니다."],
      missingItems: ["6개월 이상 근속", "정규직 전환 또는 직접고용", "전환 후 1개월 이상 고용유지"],
      nextActions: ["전환 시점과 근속기간을 다시 설계한 뒤 재검토하세요."],
      canGenerateDraft: false,
    };
  }

  if (tenure === "unknown") missingItems.push("대상자 근속기간 확인");
  if (conversion === "planned") missingItems.push("정규직 전환 형태 확정");
  if (maintain === "unknown") missingItems.push("전환 후 1개월 이상 유지계획 확정");
  if (wageIncrease === "unknown") missingItems.push("임금 인상 폭 산정");

  const summary =
    wageIncrease === "yes"
      ? "정규직 전환 지원금 60만원 구간 검토가 가능합니다."
      : "정규직 전환 지원금 기본 40만원 구간 검토가 가능합니다.";

  return {
    programId: "regular-conversion",
    status: missingItems.length > 0 ? "needs_followup" : "eligible",
    summary,
    rationale: ["상시 근로자 수 5인 이상 30인 미만 구간으로 판정했습니다."],
    missingItems,
    nextActions: [
      "전환 대상자 근속기간과 전환일자를 정리하세요.",
      "임금 인상 폭에 따라 40만원 또는 60만원 구간을 확정하세요.",
    ],
    canGenerateDraft: true,
  };
}
