import type {
  BaseEligibilityAnswers,
  DeterminationResult,
  DeterminationStatus,
  FollowUpAnswers,
  RecommendationRecord,
} from "./types.js";
import { RECOMMENDATION_TARGETS } from "./types.js";

export function recommendProgramIds(baseAnswers: BaseEligibilityAnswers) {
  const recommendations: RecommendationRecord[] = [];
  const { situations, workforceRange } = baseAnswers;

  const push = (programId: string, reason: string, matchScore: number) => {
    if (!RECOMMENDATION_TARGETS.includes(programId as (typeof RECOMMENDATION_TARGETS)[number])) return;
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

function determineEmploymentPromotion(baseAnswers: BaseEligibilityAnswers, answers: FollowUpAnswers): DeterminationResult {
  const rationale = [
    `입력하신 기업 규모를 기준으로 먼저 살펴봤어요.`,
    "취약계층 신규 채용 상황이 있어 우선 검토 대상으로 안내드리고 있어요.",
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
      summary: "지금 정보만 보면 먼저 확인이 필요한 조건이 있어요.",
      rationale: ["구직등록 이력, 채용 형태, 보수 기준 가운데 아직 맞지 않거나 확인되지 않은 항목이 있습니다."],
      missingItems: ["사전 구직등록 또는 취업지원 이력", "정규직 채용 형태", "월평균 보수 124만원 이상"],
      nextActions: ["채용 대상자 요건과 임금 수준을 다시 확인한 뒤 한 번 더 살펴보세요."],
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
    summary: status === "eligible" ? "현재 확인된 내용 기준으로는 준비를 이어가셔도 괜찮아요." : "방향은 잘 맞고 있어서 몇 가지만 더 확인하면 됩니다.",
    rationale,
    missingItems,
    nextActions: ["채용 대상자 요건을 증빙할 자료를 먼저 정리해보세요.", "채용 후 6개월 유지 계획과 임금 기준도 함께 확인해보세요."],
    canGenerateDraft: status === "eligible" || status === "needs_followup",
  };
}

function determineYouthEmployment(baseAnswers: BaseEligibilityAnswers, answers: FollowUpAnswers): DeterminationResult {
  const rationale = ["청년 정규직 채용 상황을 기준으로 먼저 살펴봤어요."];
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
      rationale: ["정규직 채용, 근로시간, 고용유지 조건 가운데 아직 맞지 않거나 확인되지 않은 항목이 있습니다."],
      missingItems: ["정규직 채용", "주 28시간 이상 근로", "6개월 이상 고용유지"],
      nextActions: ["채용 조건을 다시 정리한 뒤 한 번 더 확인해보세요."],
      canGenerateDraft: false,
    };
  }

  if (targetYouth === "unknown") missingItems.push("취업애로청년 해당 여부 확인");
  if (hours === "unknown") missingItems.push("주 소정근로시간 설계 확정");
  if (maintain === "unknown") missingItems.push("6개월 고용유지 계획 확정");
  if (baseAnswers.companySize === "대규모기업") missingItems.push("대규모기업은 원칙적으로 대상이 아니므로 별도 확인");

  const status: DeterminationStatus =
    baseAnswers.companySize === "대규모기업" ? "manual_review" : missingItems.length > 0 ? "needs_followup" : "eligible";

  rationale.push(
    baseAnswers.companySize === "중견기업"
      ? "중견기업은 비수도권 산업단지 입주 여부를 함께 확인하면 더 정확해요."
      : `${baseAnswers.companySize} 기준으로 우선 확인해봤어요.`,
  );

  return {
    programId: "youth-employment",
    status,
    summary: status === "eligible" ? "현재 기준으로는 신청 준비를 이어가셔도 괜찮아요." : "채용 방향은 잘 맞고 있어서 몇 가지 세부 조건만 더 보면 됩니다.",
    rationale,
    missingItems,
    nextActions: ["청년 취업애로 기준과 산업단지 입주 여부를 먼저 확인해보세요.", "참여신청 승인 이후 6개월 유지 계획도 함께 정리해두시면 좋아요."],
    canGenerateDraft: status === "eligible" || status === "needs_followup",
  };
}

function determineContinuedEmployment(baseAnswers: BaseEligibilityAnswers, answers: FollowUpAnswers): DeterminationResult {
  const rationale = [
    baseAnswers.locationType === "nonMetropolitan" ? "비수도권 사업장 기준으로 먼저 검토해봤어요." : "수도권 사업장 기준으로 먼저 검토해봤어요.",
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
      rationale: ["정년제도 운영, 규정 반영, 인원 비율, 대상자 계획 가운데 아직 맞지 않거나 확인되지 않은 항목이 있습니다."],
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
    summary: status === "eligible" ? "현재 기준으로는 계속 준비를 이어가셔도 괜찮아요." : "제도 방향은 잘 맞고 있어서 규정과 대상자만 더 확인하면 됩니다.",
    rationale,
    missingItems,
    nextActions: [
      "취업규칙이나 단체협약 반영 여부를 먼저 확인해보세요.",
      baseAnswers.locationType === "nonMetropolitan" ? "비수도권 기준을 적용할 자료도 함께 준비해두시면 좋아요." : "수도권 기준에 맞춰 분기별 준비 일정을 잡아보세요.",
    ],
    canGenerateDraft: true,
  };
}

function determineRegionalEmployment(_baseAnswers: BaseEligibilityAnswers, answers: FollowUpAnswers): DeterminationResult {
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
      rationale: ["계획 신고, 사업 유형, 지역 거주 요건, 고용유지 조건 가운데 아직 맞지 않거나 확인되지 않은 항목이 있습니다."],
      missingItems: ["지역고용계획 신고", "이전·신설·증설 인정", "지역 거주 구직자 채용", "6개월 고용유지"],
      nextActions: ["사업 구조와 계획 신고 절차를 먼저 정리한 뒤 다시 확인해보세요."],
      canGenerateDraft: false,
    };
  }

  if (planReported === "needs_report") missingItems.push("지역고용계획 신고 선행");
  if (projectType === "unknown") missingItems.push("이전·신설·증설 인정 여부 검토");
  if (localResident === "unknown") missingItems.push("채용 대상자의 지역 거주기간 확인");
  if (maintain === "unknown") missingItems.push("6개월 고용유지 계획 확정");

  const status: DeterminationStatus =
    planReported === "needs_report" ? "needs_followup" : missingItems.length > 0 ? "manual_review" : "eligible";

  return {
    programId: "regional-employment",
    status,
    summary: status === "eligible" ? "현재 기준으로는 신청 준비를 이어가셔도 괜찮아요." : "사업 방향은 맞고 있어서 신고와 거주 요건을 조금 더 확인하면 됩니다.",
    rationale: ["지역고용계획 신고와 지역 거주자 채용 여부가 핵심 기준이에요."],
    missingItems,
    nextActions: ["조업 일정에 맞춰 지역고용계획 신고 여부를 먼저 확정해보세요.", "채용 대상자의 거주기간과 고용유지 계획도 자료로 정리해두시면 좋아요."],
    canGenerateDraft: status === "eligible" || status === "needs_followup",
  };
}

function determineRegularConversion(baseAnswers: BaseEligibilityAnswers, answers: FollowUpAnswers): DeterminationResult {
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

  return {
    programId: "regular-conversion",
    status: missingItems.length > 0 ? "needs_followup" : "eligible",
    summary: wageIncrease === "yes" ? "현재 기준으로는 60만원 구간까지 함께 검토해볼 수 있어요." : "현재 기준으로는 기본 40만원 구간을 중심으로 살펴볼 수 있어요.",
    rationale: ["입력하신 상시 근로자 수 기준으로 먼저 살펴봤어요."],
    missingItems,
    nextActions: ["전환 대상자의 근속기간과 전환일자를 먼저 정리해보세요.", "임금 인상 폭에 따라 적용 구간도 함께 확인해보시면 좋아요."],
    canGenerateDraft: true,
  };
}

export function determinePrograms(programIds: string[], baseAnswers: BaseEligibilityAnswers, followUpAnswers: FollowUpAnswers) {
  return programIds.map((programId) => {
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
          status: "manual_review" as const,
          summary: "이 지원금은 자동 결과만으로는 안내가 충분하지 않아요.",
          rationale: ["현재 단계에서는 개별 상황을 함께 보면서 확인하는 편이 더 정확합니다."],
          missingItems: [],
          nextActions: ["운영 방식과 대상자 조건을 함께 보면서 하나씩 확인해보세요."],
          canGenerateDraft: false,
        };
    }
  });
}
