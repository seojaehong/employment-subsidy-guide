export type CompanySize = "우선지원대상기업" | "중견기업" | "대규모기업";
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

export interface EligibilityConfig {
  commonQuestions: EligibilityQuestionRecord[];
  priorityProgramIds: string[];
}

export const RECOMMENDATION_TARGETS = [
  "employment-promotion",
  "youth-employment",
  "continued-employment",
  "regional-employment",
  "regular-conversion",
] as const;

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
      options: [{ value: "yes", label: "예, 확인 가능" }, { value: "unknown", label: "아직 확인 전" }, { value: "no", label: "아니오" }],
    },
    {
      id: "employment-promotion.regularEmployment",
      scope: "program",
      programId: "employment-promotion",
      prompt: "정규직 또는 기간의 정함이 없는 형태로 채용할 예정인가요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "no", label: "아니오" }],
    },
    {
      id: "employment-promotion.maintainSixMonths",
      scope: "program",
      programId: "employment-promotion",
      prompt: "채용 후 6개월 이상 고용 유지가 가능하신가요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "unknown", label: "운영 계획 확인 필요" }, { value: "no", label: "어려움" }],
    },
    {
      id: "employment-promotion.wageLevel",
      scope: "program",
      programId: "employment-promotion",
      prompt: "예정 월평균 보수가 124만원 이상인가요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "unknown", label: "산정 전" }, { value: "no", label: "아니오" }],
    },
    {
      id: "youth-employment.targetYouth",
      scope: "program",
      programId: "youth-employment",
      prompt: "채용 대상 청년이 취업애로청년 기준에 해당하나요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "unknown", label: "확인 필요" }, { value: "no", label: "아니오" }],
    },
    {
      id: "youth-employment.regularEmployment",
      scope: "program",
      programId: "youth-employment",
      prompt: "청년을 정규직으로 채용하고 고용보험 가입 예정인가요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "no", label: "아니오" }],
    },
    {
      id: "youth-employment.hours",
      scope: "program",
      programId: "youth-employment",
      prompt: "주 소정근로시간이 28시간 이상인가요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "unknown", label: "설계 중" }, { value: "no", label: "아니오" }],
    },
    {
      id: "youth-employment.maintainSixMonths",
      scope: "program",
      programId: "youth-employment",
      prompt: "채용 후 6개월 이상 고용 유지가 가능하신가요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "unknown", label: "운영 계획 확인 필요" }, { value: "no", label: "어려움" }],
    },
    {
      id: "continued-employment.retirementPolicy",
      scope: "program",
      programId: "continued-employment",
      prompt: "사업장에서 정년제도를 1년 이상 운영했나요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "unknown", label: "규정 확인 필요" }, { value: "no", label: "아니오" }],
    },
    {
      id: "continued-employment.formalPolicy",
      scope: "program",
      programId: "continued-employment",
      prompt: "취업규칙 또는 단체협약에 계속고용제도를 명시했나요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "needs_update", label: "개정 예정" }, { value: "no", label: "아니오" }],
    },
    {
      id: "continued-employment.ratioCheck",
      scope: "program",
      programId: "continued-employment",
      prompt: "직전 연도 60세 이상 피보험자 비율이 30% 이하인가요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "unknown", label: "집계 필요" }, { value: "no", label: "아니오" }],
    },
    {
      id: "continued-employment.targetWorker",
      scope: "program",
      programId: "continued-employment",
      prompt: "정년 도달 근로자를 실제로 계속고용 또는 재고용할 계획인가요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "planned", label: "대상자 확정 전" }, { value: "no", label: "아니오" }],
    },
    {
      id: "regional-employment.planReported",
      scope: "program",
      programId: "regional-employment",
      prompt: "지역고용계획을 신고했거나 신고할 수 있나요?",
      helper: "지역고용촉진지원금 핵심 선행절차입니다.",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "needs_report", label: "아직 미신고, 준비 가능" }, { value: "no", label: "아니오" }],
    },
    {
      id: "regional-employment.projectType",
      scope: "program",
      programId: "regional-employment",
      prompt: "고용위기지역으로 이전·신설·증설 중 어떤 형태인가요?",
      type: "single",
      options: [{ value: "qualified", label: "이전·신설·증설에 해당" }, { value: "unknown", label: "판단 필요" }, { value: "no", label: "해당 없음" }],
    },
    {
      id: "regional-employment.localResident",
      scope: "program",
      programId: "regional-employment",
      prompt: "채용 대상자가 해당 지역에 3개월 이상 거주한 구직자인가요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "unknown", label: "확인 필요" }, { value: "no", label: "아니오" }],
    },
    {
      id: "regional-employment.maintainSixMonths",
      scope: "program",
      programId: "regional-employment",
      prompt: "채용 후 6개월 이상 고용 유지가 가능하신가요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "unknown", label: "운영 계획 확인 필요" }, { value: "no", label: "어려움" }],
    },
    {
      id: "regular-conversion.tenureSixMonths",
      scope: "program",
      programId: "regular-conversion",
      prompt: "전환 대상자가 현재 6개월 이상 근속했나요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "unknown", label: "근속기간 확인 필요" }, { value: "no", label: "아니오" }],
    },
    {
      id: "regular-conversion.formalConversion",
      scope: "program",
      programId: "regular-conversion",
      prompt: "정규직 전환 또는 직접고용으로 처리할 계획인가요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "planned", label: "검토 중" }, { value: "no", label: "아니오" }],
    },
    {
      id: "regular-conversion.maintainOneMonth",
      scope: "program",
      programId: "regular-conversion",
      prompt: "전환 후 1개월 이상 고용 유지가 가능하신가요?",
      type: "single",
      options: [{ value: "yes", label: "예" }, { value: "unknown", label: "운영 계획 확인 필요" }, { value: "no", label: "어려움" }],
    },
    {
      id: "regular-conversion.wageIncrease",
      scope: "program",
      programId: "regular-conversion",
      prompt: "전환 후 월평균 임금이 20만원 이상 증가하나요?",
      type: "single",
      options: [{ value: "yes", label: "예, 60만원 구간 검토" }, { value: "unknown", label: "산정 필요" }, { value: "no", label: "아니오, 40만원 구간 검토" }],
    },
  ];
}

export function getEligibilityConfig(): EligibilityConfig {
  return {
    commonQuestions: getCommonEligibilityQuestions(),
    priorityProgramIds: Array.from(RECOMMENDATION_TARGETS),
  };
}
