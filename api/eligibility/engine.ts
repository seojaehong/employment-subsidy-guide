import type {
  BaseEligibilityAnswers,
  DeterminationResult,
  DeterminationStatus,
  FollowUpAnswers,
  RecommendationRecord,
} from "./types.ts";
import { RECOMMENDATION_TARGETS } from "./types.ts";

export function recommendProgramIds(baseAnswers: BaseEligibilityAnswers) {
  const recommendations: RecommendationRecord[] = [];
  const { situations, workforceRange } = baseAnswers;

  const push = (programId: string, reason: string, matchScore: number) => {
    if (!RECOMMENDATION_TARGETS.includes(programId as (typeof RECOMMENDATION_TARGETS)[number])) return;
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

function determineEmploymentPromotion(baseAnswers: BaseEligibilityAnswers, answers: FollowUpAnswers): DeterminationResult {
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
      rationale: ["구직등록 이력, 정규직 채용 형태, 월평균 보수 기준 중 하나 이상이 충족되지 않았습니다."],
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
    summary: status === "eligible" ? "고용촉진장려금 신청 가능성이 높습니다." : "핵심 구조는 맞지만 일부 요건 확인 또는 보완이 필요합니다.",
    rationale,
    missingItems,
    nextActions: ["채용 대상자 선행요건 증빙을 확보하세요.", "고용 후 6개월 유지 계획과 임금 기준을 점검하세요."],
    canGenerateDraft: status === "eligible" || status === "needs_followup",
  };
}

function determineYouthEmployment(baseAnswers: BaseEligibilityAnswers, answers: FollowUpAnswers): DeterminationResult {
  const rationale = ["청년 정규직 채용 상황을 기준으로 청년일자리도약장려금을 판정했습니다."];
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
      rationale: ["정규직 채용, 주 28시간 이상, 6개월 유지 중 하나 이상이 충족되지 않았습니다."],
      missingItems: ["정규직 채용", "주 28시간 이상 근로", "6개월 이상 고용유지"],
      nextActions: ["채용 조건을 재설계한 뒤 다시 판정하세요."],
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
      ? "중견기업은 비수도권 산업단지 입주 여부를 추가 확인해야 합니다."
      : `${baseAnswers.companySize} 기준으로 우선 검토했습니다.`,
  );

  return {
    programId: "youth-employment",
    status,
    summary: status === "eligible" ? "청년일자리도약장려금 신청 가능성이 높습니다." : "채용유형은 적합하지만 일부 세부요건을 더 확인해야 합니다.",
    rationale,
    missingItems,
    nextActions: ["청년 취업애로 기준과 산업단지 입주 여부를 확인하세요.", "참여신청 승인 후 6개월 유지 요건을 맞춰 신청하세요."],
    canGenerateDraft: status === "eligible" || status === "needs_followup",
  };
}

function determineContinuedEmployment(baseAnswers: BaseEligibilityAnswers, answers: FollowUpAnswers): DeterminationResult {
  const rationale = [
    baseAnswers.locationType === "nonMetropolitan" ? "비수도권 사업장으로 분기 120만원 구간을 우선 적용합니다." : "수도권 사업장으로 분기 90만원 구간을 우선 적용합니다.",
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
      rationale: ["정년제도 운영, 계속고용 규정 명시, 60세 이상 비율, 대상자 계속고용 계획 중 일부가 충족되지 않았습니다."],
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
    summary: status === "eligible" ? "고령자 계속고용장려금 신청 가능성이 높습니다." : "제도 방향은 맞지만 규정과 대상자 확인을 먼저 마쳐야 합니다.",
    rationale,
    missingItems,
    nextActions: [
      "취업규칙·단체협약 개정 여부를 확정하세요.",
      baseAnswers.locationType === "nonMetropolitan" ? "비수도권 가산 구간을 적용할 증빙을 준비하세요." : "수도권 기준 금액으로 분기별 신청 계획을 세우세요.",
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
      summary: "지역고용촉진지원금 핵심 요건이 충족되지 않습니다.",
      rationale: ["지역고용계획 신고, 사업 유형, 지역 거주자 채용, 6개월 유지 중 하나 이상이 불충분합니다."],
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
    planReported === "needs_report" ? "needs_followup" : missingItems.length > 0 ? "manual_review" : "eligible";

  return {
    programId: "regional-employment",
    status,
    summary: status === "eligible" ? "지역고용촉진지원금 신청 가능성이 높습니다." : "사업 구조는 맞지만 신고·거주요건 등 선행 검토가 필요합니다.",
    rationale: ["지역고용계획 신고와 지역 거주자 채용이 핵심 선행요건입니다."],
    missingItems,
    nextActions: ["조업 시작 전후 일정에 맞춰 지역고용계획 신고 여부를 확정하세요.", "채용 대상자 거주기간과 고용유지 계획을 증빙 형태로 정리하세요."],
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

  return {
    programId: "regular-conversion",
    status: missingItems.length > 0 ? "needs_followup" : "eligible",
    summary: wageIncrease === "yes" ? "정규직 전환 지원금 60만원 구간 검토가 가능합니다." : "정규직 전환 지원금 기본 40만원 구간 검토가 가능합니다.",
    rationale: ["상시 근로자 수 5인 이상 30인 미만 구간으로 판정했습니다."],
    missingItems,
    nextActions: ["전환 대상자 근속기간과 전환일자를 정리하세요.", "임금 인상 폭에 따라 40만원 또는 60만원 구간을 확정하세요."],
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
          summary: "이 프로그램은 수동 검토가 필요합니다.",
          rationale: ["1차 판정 엔진 대상 제도가 아니어서 상담 검토가 필요합니다."],
          missingItems: [],
          nextActions: ["전문가 상담으로 개별 요건을 확인하세요."],
          canGenerateDraft: false,
        };
    }
  });
}
