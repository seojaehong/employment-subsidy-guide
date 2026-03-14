import type {
  EligibilityQuestionRecord,
  ProgramDraftRecord,
  QuestionSetVersion,
  RuleDefinition,
} from "../../shared/subsidy";
import { getCommonEligibilityQuestions, getProgramFollowUpQuestions } from "../../shared/subsidy.js";

function buildQuestionSeed(question: EligibilityQuestionRecord): Omit<QuestionSetVersion, "id"> {
  return {
    documentVersionId: null,
    questionId: question.id,
    scope: question.scope,
    programId: question.programId,
    prompt: question.prompt,
    helper: question.helper,
    type: question.type,
    options: question.options,
    published: true,
    draftStatus: "published",
  };
}

function createRule(
  targetProgramId: string,
  ruleType: RuleDefinition["ruleType"],
  inputKey: string,
  operator: RuleDefinition["operator"],
  expectedValue: string,
  overrides: Partial<Omit<RuleDefinition, "id" | "documentVersionId" | "targetProgramId" | "ruleType" | "inputKey" | "operator" | "expectedValue">> = {},
): Omit<RuleDefinition, "id"> {
  return {
    documentVersionId: null,
    targetProgramId,
    ruleType,
    inputKey,
    operator,
    expectedValue,
    published: true,
    draftStatus: "published",
    priority: overrides.priority ?? 100,
    effectStatus: overrides.effectStatus,
    effectSummary: overrides.effectSummary,
    effectMissingItem: overrides.effectMissingItem,
    effectRationale: overrides.effectRationale,
    effectNextAction: overrides.effectNextAction,
    effectReason: overrides.effectReason,
    effectMatchScore: overrides.effectMatchScore,
  };
}

const bundleQuestions: EligibilityQuestionRecord[] = [
  {
    id: "work-life-balance.shortenHours",
    scope: "program",
    programId: "work-life-balance",
    prompt: "근로시간 단축 제도를 실제로 운영할 예정인가요?",
    type: "single",
    options: [
      { value: "yes", label: "예" },
      { value: "planned", label: "도입 예정" },
      { value: "no", label: "아니오" },
    ],
  },
  {
    id: "work-life-balance.tracking",
    scope: "program",
    programId: "work-life-balance",
    prompt: "근태기록과 임금 감소 보전 내역을 남길 수 있나요?",
    type: "single",
    options: [
      { value: "yes", label: "예" },
      { value: "unknown", label: "확인 필요" },
      { value: "no", label: "아니오" },
    ],
  },
  {
    id: "work-life-45.laborAgreement",
    scope: "program",
    programId: "work-life-45",
    prompt: "노사 합의로 주 4.5일제 또는 근로시간 단축안을 확정했나요?",
    type: "single",
    options: [
      { value: "yes", label: "예" },
      { value: "planned", label: "합의 진행 중" },
      { value: "no", label: "아니오" },
    ],
  },
  {
    id: "work-life-45.foundationApproval",
    scope: "program",
    programId: "work-life-45",
    prompt: "공고형 사업 참여 또는 운영 승인 준비가 되어 있나요?",
    type: "single",
    options: [
      { value: "yes", label: "예" },
      { value: "unknown", label: "확인 필요" },
      { value: "no", label: "아니오" },
    ],
  },
  {
    id: "flexible-work.policy",
    scope: "program",
    programId: "flexible-work",
    prompt: "재택·선택근무 관련 내부 규정 또는 운영 정책이 있나요?",
    type: "single",
    options: [
      { value: "yes", label: "예" },
      { value: "planned", label: "정책 수립 중" },
      { value: "no", label: "아니오" },
    ],
  },
  {
    id: "flexible-work.tracking",
    scope: "program",
    programId: "flexible-work",
    prompt: "출퇴근·근무이력·시스템 사용 로그를 증빙할 수 있나요?",
    type: "single",
    options: [
      { value: "yes", label: "예" },
      { value: "unknown", label: "확인 필요" },
      { value: "no", label: "아니오" },
    ],
  },
  {
    id: "parental-leave-full.leaveGranted",
    scope: "program",
    programId: "parental-leave-full",
    prompt: "육아휴직을 30일 이상 실제로 부여할 계획인가요?",
    type: "single",
    options: [
      { value: "yes", label: "예" },
      { value: "planned", label: "부여 예정" },
      { value: "no", label: "아니오" },
    ],
  },
  {
    id: "parental-leave-replacement.replacementHire",
    scope: "program",
    programId: "parental-leave-replacement",
    prompt: "대체인력을 30일 이상 채용했거나 채용할 수 있나요?",
    type: "single",
    options: [
      { value: "yes", label: "예" },
      { value: "planned", label: "채용 예정" },
      { value: "no", label: "아니오" },
    ],
  },
  {
    id: "work-sharing.allowance",
    scope: "program",
    programId: "work-sharing",
    prompt: "업무분담자를 지정하고 수당 지급 구조를 마련했나요?",
    type: "single",
    options: [
      { value: "yes", label: "예" },
      { value: "planned", label: "설계 중" },
      { value: "no", label: "아니오" },
    ],
  },
  {
    id: "parental-leave-childcare.shortHours",
    scope: "program",
    programId: "parental-leave-childcare",
    prompt: "육아기 근로시간 단축을 30일 이상 운영할 수 있나요?",
    type: "single",
    options: [
      { value: "yes", label: "예" },
      { value: "planned", label: "운영 예정" },
      { value: "no", label: "아니오" },
    ],
  },
  {
    id: "employment-maintenance.crisis",
    scope: "program",
    programId: "employment-maintenance",
    prompt: "매출 감소 등 고용조정이 불가피한 경영상 사유가 있나요?",
    type: "single",
    options: [
      { value: "yes", label: "예" },
      { value: "unknown", label: "증빙 검토 필요" },
      { value: "no", label: "아니오" },
    ],
  },
];

export function getDefaultQuestionSeeds() {
  return [...getCommonEligibilityQuestions(), ...getProgramFollowUpQuestions(), ...bundleQuestions].map(buildQuestionSeed);
}

export function getDefaultRuleSeeds() {
  return [
    createRule("employment-promotion", "recommendation", "situations", "includes", "newHire", {
      effectReason: "취약계층 신규채용 상황이 있어 고용촉진장려금을 추천합니다.",
      effectMatchScore: 92,
      priority: 10,
    }),
    createRule("youth-employment", "recommendation", "situations", "includes", "youthHire", {
      effectReason: "청년 정규직 채용 계획이 있어 청년일자리도약장려금을 추천합니다.",
      effectMatchScore: 94,
      priority: 10,
    }),
    createRule("continued-employment", "recommendation", "situations", "includes", "elderlyHire", {
      effectReason: "고령자 계속고용 계획이 있어 계속고용장려금을 추천합니다.",
      effectMatchScore: 90,
      priority: 10,
    }),
    createRule("regional-employment", "recommendation", "situations", "includes", "regionalExpansion", {
      effectReason: "지역 이전·신설·증설 계획이 있어 지역고용촉진지원금을 추천합니다.",
      effectMatchScore: 91,
      priority: 10,
    }),
    createRule("regular-conversion", "recommendation", "situations", "includes", "regularConversion", {
      effectReason: "비정규직 전환 상황이 있어 정규직 전환 지원금을 추천합니다.",
      effectMatchScore: 96,
      priority: 10,
    }),
    createRule("work-life-balance", "recommendation", "situations", "includes", "workLifeBalance", {
      effectReason: "근로시간 단축·워라밸 제도 운영 상황이라 워라밸 일자리 장려금을 추천합니다.",
      effectMatchScore: 88,
      priority: 20,
    }),
    createRule("work-life-45", "recommendation", "situations", "includes", "workLifeBalance", {
      effectReason: "주 4.5일제 도입 가능성이 있어 워라밸 4.5 프로젝트를 추천합니다.",
      effectMatchScore: 84,
      priority: 20,
    }),
    createRule("flexible-work", "recommendation", "situations", "includes", "workLifeBalance", {
      effectReason: "유연근무 도입 상황이라 일·가정 양립 환경개선을 추천합니다.",
      effectMatchScore: 86,
      priority: 20,
    }),
    createRule("parental-leave-full", "recommendation", "situations", "includes", "parentalLeave", {
      effectReason: "출산·육아휴직 운영 상황이라 육아휴직 지원을 추천합니다.",
      effectMatchScore: 90,
      priority: 20,
    }),
    createRule("parental-leave-replacement", "recommendation", "situations", "includes", "parentalLeave", {
      effectReason: "대체인력 채용 가능성이 있어 대체인력 지원금을 추천합니다.",
      effectMatchScore: 85,
      priority: 20,
    }),
    createRule("work-sharing", "recommendation", "situations", "includes", "parentalLeave", {
      effectReason: "업무분담 구조가 있다면 업무분담 지원금을 함께 검토합니다.",
      effectMatchScore: 80,
      priority: 20,
    }),
    createRule("parental-leave-childcare", "recommendation", "situations", "includes", "parentalLeave", {
      effectReason: "육아기 근로시간 단축 운영 시 지원금 검토가 가능합니다.",
      effectMatchScore: 82,
      priority: 20,
    }),
    createRule("employment-maintenance", "recommendation", "situations", "includes", "employmentMaintenance", {
      effectReason: "경영위기 대응 고용유지 상황이라 고용유지지원금을 추천합니다.",
      effectMatchScore: 89,
      priority: 20,
    }),
    createRule("employment-maintenance", "determination", "employment-maintenance.crisis", "equals", "no", {
      effectStatus: "ineligible",
      effectSummary: "지금 정보만 보면 경영상 사유를 먼저 확인해보는 편이 좋아요.",
      effectMissingItem: "매출 감소 등 고용조정 불가피 사유",
      effectRationale: "고용유지지원금은 경영상 사유를 설명할 자료가 함께 있어야 더 정확하게 볼 수 있어요.",
      effectNextAction: "매출 감소나 휴업 사유를 자료로 먼저 정리해보세요.",
      priority: 10,
    }),
    createRule("employment-maintenance", "determination", "employment-maintenance.crisis", "equals", "unknown", {
      effectStatus: "needs_followup",
      effectSummary: "방향은 맞고 있어서 경영상 사유 자료만 더 확인하면 됩니다.",
      effectMissingItem: "경영상 사유 증빙",
      effectRationale: "휴업이나 휴직 계획과 함께 경영상 사유를 정리해두면 다음 판단이 쉬워져요.",
      effectNextAction: "매출 감소 자료와 고용유지 계획을 함께 준비해보세요.",
      priority: 20,
    }),
    createRule("work-life-balance", "determination", "work-life-balance.shortenHours", "equals", "no", {
      effectStatus: "ineligible",
      effectSummary: "지금 정보만 보면 근로시간 단축 운영 계획을 먼저 확인해보는 편이 좋아요.",
      effectMissingItem: "근로시간 단축 제도 운영",
      effectRationale: "이 지원금은 실제 단축 운영 계획이 있을 때 더 정확하게 볼 수 있어요.",
      effectNextAction: "단축 제도와 임금 보전 구조를 먼저 정리해보세요.",
      priority: 10,
    }),
    createRule("work-life-balance", "determination", "work-life-balance.tracking", "not_equals", "yes", {
      effectStatus: "needs_followup",
      effectSummary: "방향은 맞고 있어서 근태와 임금 보전 자료를 조금 더 준비하면 됩니다.",
      effectMissingItem: "근태기록 및 임금 감소 보전 증빙",
      effectRationale: "운영 방식이 실제로 남아 있는지 보여주는 자료가 있으면 판단이 훨씬 쉬워져요.",
      effectNextAction: "근태관리 방식과 임금보전 기준을 문서로 정리해보세요.",
      priority: 20,
    }),
    createRule("work-life-45", "determination", "work-life-45.laborAgreement", "equals", "no", {
      effectStatus: "ineligible",
      effectSummary: "지금 정보만 보면 노사 합의 여부를 먼저 확인해보는 편이 좋아요.",
      effectMissingItem: "노사 합의",
      effectRationale: "주 4.5일제는 운영안과 합의 절차가 함께 있어야 더 정확하게 볼 수 있어요.",
      effectNextAction: "노사 합의와 운영안을 먼저 정리해보세요.",
      priority: 10,
    }),
    createRule("work-life-45", "determination", "work-life-45.foundationApproval", "not_equals", "yes", {
      effectStatus: "needs_followup",
      effectSummary: "방향은 맞고 있어서 공고 참여 준비만 조금 더 확인하면 됩니다.",
      effectMissingItem: "공고 참여 또는 운영 승인 준비",
      effectRationale: "공고형 사업은 참여 준비 상태가 정리되어 있으면 다음 단계로 이어가기 쉬워요.",
      effectNextAction: "공고 일정과 내부 승인 절차를 한 번 더 점검해보세요.",
      priority: 20,
    }),
    createRule("flexible-work", "determination", "flexible-work.policy", "equals", "no", {
      effectStatus: "ineligible",
      effectSummary: "지금 정보만 보면 유연근무 운영 기준을 먼저 확인해보는 편이 좋아요.",
      effectMissingItem: "유연근무 운영 정책",
      effectRationale: "재택이나 선택근무는 운영 기준이 정리되어 있으면 판단이 훨씬 쉬워져요.",
      effectNextAction: "정책과 운영 기준을 먼저 정리해보세요.",
      priority: 10,
    }),
    createRule("flexible-work", "determination", "flexible-work.tracking", "not_equals", "yes", {
      effectStatus: "needs_followup",
      effectSummary: "운영 방향은 맞고 있어서 로그와 근태 자료를 조금 더 준비하면 됩니다.",
      effectMissingItem: "시스템 로그 및 근태 증빙",
      effectRationale: "실제 운영 기록이 남아 있으면 신청 가능성을 더 정확하게 볼 수 있어요.",
      effectNextAction: "시스템 도입 여부나 로그 수집 방식을 먼저 정리해보세요.",
      priority: 20,
    }),
    createRule("parental-leave-full", "determination", "parental-leave-full.leaveGranted", "equals", "no", {
      effectStatus: "ineligible",
      effectSummary: "지금 정보만 보면 육아휴직 운영 계획을 먼저 확인해보는 편이 좋아요.",
      effectMissingItem: "30일 이상 육아휴직 부여",
      effectRationale: "실제 육아휴직 운영 계획이 있어야 다음 판단이 쉬워져요.",
      effectNextAction: "육아휴직 운영 계획을 먼저 정리해보세요.",
      priority: 10,
    }),
    createRule("parental-leave-full", "determination", "parental-leave-full.leaveGranted", "equals", "planned", {
      effectStatus: "needs_followup",
      effectSummary: "방향은 맞고 있어서 실제 부여 일정만 조금 더 확인하면 됩니다.",
      effectMissingItem: "육아휴직 부여 일정 확정",
      effectRationale: "계획이 잡혀 있더라도 일정이 정리되면 다음 준비가 훨씬 쉬워져요.",
      effectNextAction: "근로자별 휴직 일정과 신청 절차를 정리해보세요.",
      priority: 20,
    }),
    createRule("parental-leave-replacement", "determination", "parental-leave-replacement.replacementHire", "equals", "no", {
      effectStatus: "ineligible",
      effectSummary: "지금 정보만 보면 대체인력 채용 계획을 먼저 확인해보는 편이 좋아요.",
      effectMissingItem: "30일 이상 대체인력 채용",
      effectRationale: "대체인력 채용 계획이 있어야 다음 판단을 더 정확하게 할 수 있어요.",
      effectNextAction: "대체인력 채용 계획과 기간을 먼저 정리해보세요.",
      priority: 10,
    }),
    createRule("parental-leave-replacement", "determination", "parental-leave-replacement.replacementHire", "equals", "planned", {
      effectStatus: "needs_followup",
      effectSummary: "방향은 맞고 있어서 채용 일정만 조금 더 확인하면 됩니다.",
      effectMissingItem: "대체인력 채용 일정",
      effectRationale: "채용 일정이 정리되면 실제 준비 수준을 더 정확하게 볼 수 있어요.",
      effectNextAction: "대체인력 채용 공고와 근로계약 계획을 준비해보세요.",
      priority: 20,
    }),
    createRule("work-sharing", "determination", "work-sharing.allowance", "equals", "no", {
      effectStatus: "ineligible",
      effectSummary: "지금 정보만 보면 업무분담 구조를 먼저 확인해보는 편이 좋아요.",
      effectMissingItem: "업무분담 지정 및 수당 구조",
      effectRationale: "업무분담자 지정과 수당 기준이 함께 있어야 다음 판단이 쉬워져요.",
      effectNextAction: "업무분담 체계와 수당 기준을 먼저 정리해보세요.",
      priority: 10,
    }),
    createRule("work-sharing", "determination", "work-sharing.allowance", "equals", "planned", {
      effectStatus: "needs_followup",
      effectSummary: "방향은 맞고 있어서 수당 설계와 대상자만 조금 더 확인하면 됩니다.",
      effectMissingItem: "업무분담 수당 설계",
      effectRationale: "운영 기준이 정리되면 실제 적용 가능성을 더 정확하게 볼 수 있어요.",
      effectNextAction: "업무분담 대상자와 수당 지급 기준을 정리해보세요.",
      priority: 20,
    }),
    createRule("parental-leave-childcare", "determination", "parental-leave-childcare.shortHours", "equals", "no", {
      effectStatus: "ineligible",
      effectSummary: "지금 정보만 보면 근로시간 단축 운영 계획을 먼저 확인해보는 편이 좋아요.",
      effectMissingItem: "30일 이상 육아기 근로시간 단축 운영",
      effectRationale: "실제 단축 운영 계획이 있어야 다음 판단을 더 정확하게 할 수 있어요.",
      effectNextAction: "단축 대상자와 운영 기간을 먼저 정리해보세요.",
      priority: 10,
    }),
    createRule("parental-leave-childcare", "determination", "parental-leave-childcare.shortHours", "equals", "planned", {
      effectStatus: "needs_followup",
      effectSummary: "방향은 맞고 있어서 운영 일정만 조금 더 확인하면 됩니다.",
      effectMissingItem: "단축 운영 일정 확정",
      effectRationale: "운영 일정이 정리되면 실제 준비 수준을 더 정확하게 볼 수 있어요.",
      effectNextAction: "단축 시작일과 임금 처리 기준을 정리해보세요.",
      priority: 20,
    }),
  ];
}

export function buildDraftSnapshotFromOperationalPrograms(programs: ProgramDraftRecord[]) {
  return programs.map((program) => ({
    ...program,
    draftStatus: "draft" as const,
  }));
}
