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
      helper: "보통 고용보험 기준으로 구분해요.",
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
      helper: "일부 지원금은 인원 구간에 따라 가능 여부가 달라져요.",
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
      helper: "지역과 금액 구간을 살펴볼 때 함께 참고해요.",
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
      helper: "이 항목은 초반에 꼭 확인하는 기준이에요.",
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
      helper: "이 지원금은 계획 신고 여부를 먼저 확인하는 편이에요.",
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
    push("employment-promotion", "취약계층 신규 채용 계획이 있어 먼저 살펴볼 지원금으로 안내드려요.", 92);
  }
  if (situations.includes("youthHire")) {
    push("youth-employment", "청년 정규직 채용 계획이 있어 우선 살펴볼 지원금으로 보고 있어요.", 94);
  }
  if (situations.includes("elderlyHire")) {
    push("continued-employment", "고령자 계속고용이나 재고용 계획이 있어 함께 확인해볼 지원금이에요.", 90);
  }
  if (situations.includes("regionalExpansion")) {
    push("regional-employment", "이전·신설·증설 상황이 있어 지역고용촉진지원금도 함께 살펴보고 있어요.", 91);
  }
  if (situations.includes("regularConversion")) {
    const baseReason =
      workforceRange === "5to29"
        ? "현재 인원 구간 기준으로는 정규직 전환 지원금을 먼저 살펴볼 수 있어요."
        : "정규직 전환 계획은 맞지만 인원 구간은 한 번 더 확인해보는 편이 좋아요.";
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
        summary: "이 지원금은 자동 결과만으로는 안내가 충분하지 않아요.",
        rationale: ["현재 단계에서는 개별 상황을 함께 보면서 확인하는 편이 더 정확합니다."],
        missingItems: [],
        nextActions: ["운영 방식과 대상자 조건을 함께 보면서 하나씩 확인해보세요."],
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
    `입력하신 기업 규모를 기준으로 먼저 살펴봤어요.`,
    "취약계층 신규 채용 상황이 있어 우선 검토 대상으로 안내드리고 있어요.",
  ];
  const missingItems: string[] = [];

  const registration = getFollowValue(answers, "employment-promotion.jobSeekerRegistration");
  const regularEmployment = getFollowValue(answers, "employment-promotion.regularEmployment");
  const maintain = getFollowValue(answers, "employment-promotion.maintainSixMonths");
  const wage = getFollowValue(answers, "employment-promotion.wageLevel");

  if (registration === "no" || regularEmployment === "no" || wage === "no" || maintain === "no") {
    return {
      programId: "employment-promotion",
      status: "ineligible",
      summary: "지금 정보만 보면 먼저 확인이 필요한 조건이 있어요.",
      rationale: [
        "구직등록 이력, 채용 형태, 고용유지, 보수 기준 가운데 아직 맞지 않거나 확인되지 않은 항목이 있습니다.",
      ],
      missingItems: ["사전 구직등록 또는 취업지원 이력", "정규직 채용 형태", "6개월 이상 고용유지", "월평균 보수 124만원 이상"],
      nextActions: ["채용 대상자 요건과 임금 수준을 다시 확인한 뒤 한 번 더 살펴보세요."],
      canGenerateDraft: false,
    };
  }

  if (registration === "unknown") missingItems.push("채용 대상자의 구직등록 또는 취업지원 이력 확인");
  if (maintain === "unknown") missingItems.push("6개월 고용유지 운영계획 확정");
  if (wage === "unknown") missingItems.push("월평균 보수 산정");
  const status: DeterminationStatus = missingItems.length > 0 ? "needs_followup" : "eligible";

  return {
    programId: "employment-promotion",
    status,
    summary:
      status === "eligible"
        ? "현재 확인된 내용 기준으로는 준비를 이어가셔도 괜찮아요."
        : "몇 가지 조건만 더 확인되면 준비를 이어가기 한결 수월해집니다.",
    rationale,
    missingItems,
    nextActions: [
      "채용 대상자 요건을 증빙할 자료를 먼저 정리해보세요.",
      "채용 후 6개월 유지 계획과 임금 기준도 함께 확인해보세요.",
    ],
    canGenerateDraft: status === "eligible" || status === "needs_followup",
  };
}

function determineYouthEmployment(
  baseAnswers: BaseEligibilityAnswers,
  answers: FollowUpAnswers,
): DeterminationResult {
  const rationale = [
    "청년 정규직 채용 상황을 기준으로 먼저 살펴봤어요.",
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
      summary: "지금 정보만 보면 채용 조건을 조금 더 살펴볼 필요가 있어요.",
      rationale: [
        "정규직 채용, 근로시간, 고용유지 조건 가운데 아직 맞지 않거나 확인되지 않은 항목이 있습니다.",
      ],
      missingItems: ["정규직 채용", "주 28시간 이상 근로", "6개월 이상 고용유지"],
      nextActions: ["채용 조건을 다시 정리한 뒤 한 번 더 확인해보세요."],
      canGenerateDraft: false,
    };
  }

  if (baseAnswers.companySize === "대규모기업") {
    return {
      programId: "youth-employment",
      status: "ineligible",
      summary: "지금 정보만 보면 기업 규모 기준을 먼저 다시 확인해보는 편이 좋아요.",
      rationale: ["청년 채용 장려금은 현재 입력하신 대규모기업 기준으로는 바로 적용하기 어려운 경우가 많습니다."],
      missingItems: ["기업 규모 기준 재확인"],
      nextActions: ["기업 규모와 적용 가능한 예외 요건이 있는지 먼저 다시 살펴보세요."],
      canGenerateDraft: false,
    };
  }

  if (targetYouth === "unknown") missingItems.push("취업애로청년 해당 여부 확인");
  if (hours === "unknown") missingItems.push("주 소정근로시간 설계 확정");
  if (maintain === "unknown") missingItems.push("6개월 고용유지 계획 확정");

  const status: DeterminationStatus = missingItems.length > 0 ? "needs_followup" : "eligible";

  rationale.push(
    baseAnswers.companySize === "중견기업"
      ? "중견기업은 비수도권 산업단지 입주 여부를 함께 확인하면 더 정확해요."
      : `${baseAnswers.companySize} 기준으로 우선 확인해봤어요.`,
  );

  return {
    programId: "youth-employment",
    status,
    summary:
      status === "eligible"
        ? "현재 기준으로는 신청 준비를 이어가셔도 괜찮아요."
        : "몇 가지 세부 조건만 더 확인되면 준비 방향을 더 분명하게 잡을 수 있어요.",
    rationale,
    missingItems,
    nextActions: [
      "청년 취업애로 기준과 산업단지 입주 여부를 먼저 확인해보세요.",
      "참여신청 승인 이후 6개월 유지 계획도 함께 정리해두시면 좋아요.",
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
      ? "비수도권 사업장 기준으로 먼저 검토해봤어요."
      : "수도권 사업장 기준으로 먼저 검토해봤어요.",
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
      summary: "지금 정보만 보면 제도 요건을 조금 더 확인할 필요가 있어요.",
      rationale: [
        "정년제도 운영, 규정 반영, 인원 비율, 대상자 계획 가운데 아직 맞지 않거나 확인되지 않은 항목이 있습니다.",
      ],
      missingItems: ["정년제도 운영", "취업규칙·단체협약 개정", "60세 이상 비율 요건", "계속고용 대상자 확정"],
      nextActions: ["취업규칙과 인력구성 자료를 다시 확인한 뒤 한 번 더 살펴보세요."],
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
        ? "현재 기준으로는 계속 준비를 이어가셔도 괜찮아요."
        : "규정과 대상자만 조금 더 확인되면 다음 준비를 이어가기 좋아요.",
    rationale,
    missingItems,
    nextActions: [
      "취업규칙이나 단체협약 반영 여부를 먼저 확인해보세요.",
      baseAnswers.locationType === "nonMetropolitan"
        ? "비수도권 기준을 적용할 자료도 함께 준비해두시면 좋아요."
        : "수도권 기준에 맞춰 분기별 준비 일정을 잡아보세요.",
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
      summary: "지금 정보만 보면 선행 조건을 조금 더 확인할 필요가 있어요.",
      rationale: [
        "계획 신고, 사업 유형, 지역 거주 요건, 고용유지 조건 가운데 아직 맞지 않거나 확인되지 않은 항목이 있습니다.",
      ],
      missingItems: ["지역고용계획 신고", "이전·신설·증설 인정", "지역 거주 구직자 채용", "6개월 고용유지"],
      nextActions: ["사업 구조와 계획 신고 절차를 먼저 정리한 뒤 다시 확인해보세요."],
      canGenerateDraft: false,
    };
  }

  if (planReported === "needs_report") missingItems.push("지역고용계획 신고 선행");
  if (projectType === "unknown") missingItems.push("이전·신설·증설 인정 여부 검토");
  if (localResident === "unknown") missingItems.push("채용 대상자의 지역 거주기간 확인");
  if (maintain === "unknown") missingItems.push("6개월 고용유지 계획 확정");

  const status: DeterminationStatus = missingItems.length > 0 ? "needs_followup" : "eligible";

  return {
    programId: "regional-employment",
    status,
    summary:
      status === "eligible"
        ? "현재 기준으로는 신청 준비를 이어가셔도 괜찮아요."
        : "신고와 거주 요건만 조금 더 확인되면 준비 수준을 더 분명하게 볼 수 있어요.",
    rationale: ["지역고용계획 신고와 지역 거주자 채용 여부가 핵심 기준이에요."],
    missingItems,
    nextActions: [
      "조업 일정에 맞춰 지역고용계획 신고 여부를 먼저 확정해보세요.",
      "채용 대상자의 거주기간과 고용유지 계획도 자료로 정리해두시면 좋아요.",
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
      summary: "지금 정보만 보면 인원 구간 조건을 먼저 다시 확인해보는 편이 좋아요.",
      rationale: ["입력하신 상시 근로자 수 구간이 지원 대상 범위와 다르게 보입니다."],
      missingItems: ["5인 이상 30인 미만 기업 요건"],
      nextActions: ["근로자 수 기준을 다시 확인해보시거나 다른 지원금도 함께 살펴보세요."],
      canGenerateDraft: false,
    };
  }

  if (tenure === "no" || conversion === "no" || maintain === "no") {
    return {
      programId: "regular-conversion",
      status: "ineligible",
      summary: "지금 정보만 보면 전환 조건을 조금 더 확인할 필요가 있어요.",
      rationale: ["근속기간, 전환 형태, 전환 후 유지 조건 가운데 아직 맞지 않거나 확인되지 않은 항목이 있습니다."],
      missingItems: ["6개월 이상 근속", "정규직 전환 또는 직접고용", "전환 후 1개월 이상 고용유지"],
      nextActions: ["전환 시점과 근속기간을 다시 정리한 뒤 한 번 더 확인해보세요."],
      canGenerateDraft: false,
    };
  }

  if (tenure === "unknown") missingItems.push("대상자 근속기간 확인");
  if (conversion === "planned") missingItems.push("정규직 전환 형태 확정");
  if (maintain === "unknown") missingItems.push("전환 후 1개월 이상 유지계획 확정");
  if (wageIncrease === "unknown") missingItems.push("임금 인상 폭 산정");

  const summary =
    wageIncrease === "yes"
      ? "현재 기준으로는 60만원 구간까지 함께 검토해볼 수 있어요."
      : "현재 기준으로는 기본 40만원 구간을 중심으로 살펴볼 수 있어요.";

  return {
    programId: "regular-conversion",
    status: missingItems.length > 0 ? "needs_followup" : "eligible",
    summary,
    rationale: ["입력하신 상시 근로자 수 기준으로 먼저 살펴봤어요."],
    missingItems,
    nextActions: [
      "전환 대상자의 근속기간과 전환일자를 먼저 정리해보세요.",
      "임금 인상 폭에 따라 적용 구간도 함께 확인해보시면 좋아요.",
    ],
    canGenerateDraft: true,
  };
}
