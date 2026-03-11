// ============================================================
// 2026년도 고용장려금 데이터
// 출처: 노무법인 위너스 — 2026년도 고용장려금 적합여부검토
// ============================================================

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
  amountLabel: string; // 대표 금액 (카드 표시용)
  duration: string;
  applicationCycle: string;
  exclusions: string[];
  notes: string[];
  tags: string[];
  highlight?: boolean; // 주요 지원금 강조
}

export const subsidyData: SubsidyItem[] = [
  // ─── 고용창출장려금 ───────────────────────────────────────
  {
    id: "employment-promotion",
    category: "고용창출장려금",
    name: "고용촉진장려금",
    description:
      "취업이 어려운 취약계층(취업프로그램 이수자, 중증 장애인, 여성가장, 섬지역 거주자 등)을 신규 채용한 사업주에게 지원하는 장려금입니다.",
    requirements: [
      "취업프로그램 이수자, 중증 장애인, 여성가장, 섬지역 거주자 등 취약계층 신규채용",
      "고용 후 정년까지 기간이 2년 이상 잔존",
      "중대 산업재해 발생 등으로 명단 공표 중인 사업주 제외",
    ],
    amount: {
      우선지원대상기업: "월 60만원",
      중견기업: "월 30만원",
    },
    amountLabel: "월 최대 60만원",
    duration: "1~2년 (신규 근로자 1인당)",
    applicationCycle: "신청 후 지급",
    exclusions: [
      "중대 산업재해 발생으로 명단 공표 중인 사업주",
      "고용 후 정년까지 기간이 2년 미만인 경우",
    ],
    notes: ["신규 근로자 1인당 1~2년 지원"],
    tags: ["취약계층", "신규채용", "우선지원"],
    highlight: true,
  },
  {
    id: "work-life-balance",
    category: "고용안정장려금",
    name: "워라밸 일자리 장려금",
    description:
      "주 35시간 이상 근무하는 근로자를 시간선택제(주 15~30시간)로 전환한 경우 사업주에게 지원하는 장려금입니다.",
    requirements: [
      "1주 근로시간이 35시간 이상 근로자를 시간선택제 근로자(15~30시간)로 전환",
      "연장근로 월 10시간 초과 또는 근태관리 누락 일수 월 3일 초과 시 지급 제한",
    ],
    amount: {
      우선지원대상기업: "임금감소액보전금 월 20만원 + 간접노무비 월 30만원",
      중견기업: "간접노무비만 지원",
    },
    amountLabel: "월 최대 50만원",
    duration: "해당 기간",
    applicationCycle: "매 3개월마다 신청",
    exclusions: [
      "연장근로 월 10시간 초과 시",
      "근태관리 누락 일수 월 3일 초과 시",
    ],
    notes: ["임금감소액보전금 월 20만원 + 간접노무비 월 30만원"],
    tags: ["시간선택제", "워라밸", "근무시간단축"],
  },
  {
    id: "work-life-45",
    category: "고용안정장려금",
    name: "워라밸 일자리 장려금 (4.5프로젝트)",
    description:
      "임금 감소 없이 주 4.5일제를 도입한 20인 이상 우선지원대상기업에 지원하는 장려금입니다.",
    requirements: [
      "임금감소 없이 주 4.5일제 도입",
      "20인 이상 우선지원대상기업",
    ],
    amount: {
      우선지원대상기업: "간접노무비 지원",
    },
    amountLabel: "간접노무비 지원",
    duration: "최대 1년간 분기별 지급",
    applicationCycle: "분기별 신청",
    exclusions: [],
    notes: ["20인 이상 우선지원대상기업만 해당", "최대 1년간 분기별 지급"],
    tags: ["주4.5일제", "근무혁신", "우선지원"],
  },
  {
    id: "flexible-work",
    category: "고용안정장려금",
    name: "일·가정 양립 환경개선 지원",
    subName: "유연근무제 / 인프라구축",
    description:
      "유연근무제(선택근무제, 재량근무제, 원격근무제, 재택근무제)를 활용하거나 근무혁신 인센티브제 사업에 참여하여 우수기업으로 선정된 경우 지원합니다.",
    requirements: [
      "유연근무제(선택근무제, 재량근무제, 원격근무제, 재택근무제) 활용",
      "또는 근무혁신 인센티브제 사업 참여하여 근무혁신 우수기업으로 선정",
      "우선지원대상기업 및 중견기업 사업주",
    ],
    amount: {
      우선지원대상기업: "간접노무비 월 최대 30만원 / 재택·원격근무 인프라: 시스템 구축 비용의 50% 이내, 2,000만원 한도 / 근무혁신 인프라: 투자금액의 50~80% 이내, 2,000만원 한도",
    },
    amountLabel: "월 최대 30만원 + 인프라 최대 2,000만원",
    duration: "유연근무 활용근로자 1명당 1년 지원",
    applicationCycle: "매 3개월마다 신청",
    exclusions: [],
    notes: [
      "재택·원격근무 인프라: 시스템 구축 비용의 50% 이내, 2,000만원 한도",
      "근무혁신 인프라: 근무혁신 우수기업 등급에 따라 투자금액의 50~80% 이내, 2,000만원 한도",
    ],
    tags: ["유연근무", "재택근무", "원격근무", "인프라"],
    highlight: true,
  },
  {
    id: "parental-leave-replacement",
    category: "고용안정장려금",
    name: "출산육아기 고용안정장려금",
    subName: "대체인력 인건비",
    description:
      "출산전후휴가, 유사산휴가, 육아기 근로시간 단축을 30일 이상 허용하고, 대체인력을 30일 이상 고용한 우선지원대상기업에 지원합니다.",
    requirements: [
      "출산전후휴가, 유사산휴가, 육아기 근로시간 단축을 30일 이상 허용",
      "대체인력을 30일 이상 고용",
      "우선지원대상기업",
      "월 통상임금의 80% 한도",
    ],
    amount: {
      우선지원대상기업: "30인 미만: 월 140만원 / 30인 이상: 월 130만원 (육아기단축대체인력지원금은 월 120만원)",
    },
    amountLabel: "월 최대 140만원",
    duration: "해당 기간",
    applicationCycle: "신청 후 지급",
    exclusions: [],
    notes: ["월 통상임금의 80% 한도"],
    tags: ["출산", "육아", "대체인력", "우선지원"],
    highlight: true,
  },
  {
    id: "work-sharing",
    category: "고용안정장려금",
    name: "출산육아기 고용안정장려금",
    subName: "업무분담지원금",
    description:
      "육아휴직, 육아근로단축 30일 이상 부여 시 업무분담자를 지정하여 업무분담수당을 지급한 경우 지원합니다.",
    requirements: [
      "육아휴직 또는 육아기근로시간단축 30일 이상 부여",
      "업무분담자 지정하여 업무분담수당 지급",
    ],
    amount: {
      우선지원대상기업: "30인 미만: 월 최대 60만원 / 30인 이상: 월 최대 40만원 (육아기근로시간단축 업무분담지원금은 월 20만원)",
    },
    amountLabel: "월 최대 60만원",
    duration: "해당 기간",
    applicationCycle: "신청 후 지급",
    exclusions: [],
    notes: [],
    tags: ["육아", "업무분담", "우선지원"],
  },
  {
    id: "parental-leave-childcare",
    category: "고용안정장려금",
    name: "출산육아기 고용안정장려금",
    subName: "육아기근로시간단축",
    description: "육아기 근로시간 단축을 허용한 우선지원대상기업에 지원합니다.",
    requirements: ["육아기근로시간단축 허용", "우선지원대상기업"],
    amount: {
      우선지원대상기업: "월 30만원 (인센티브 적용 시 월 40만원)",
    },
    amountLabel: "월 최대 40만원",
    duration: "해당 기간",
    applicationCycle: "신청 후 지급",
    exclusions: [],
    notes: ["인센티브 적용 시 월 40만원"],
    tags: ["육아", "근로시간단축", "우선지원"],
  },
  {
    id: "parental-leave-full",
    category: "고용안정장려금",
    name: "출산육아기 고용안정장려금",
    subName: "육아휴직",
    description:
      "근로자에게 육아휴직을 30일 이상 허용한 우선지원대상기업에 지원합니다.",
    requirements: [
      "근로자에게 육아휴직을 30일 이상 허용",
      "우선지원대상기업",
    ],
    amount: {
      우선지원대상기업:
        "만 12개월 이내: 첫 3개월 100만원 + 이후 월 30만원 / 만 12개월 초과: 월 30만원 / 남성 인센티브: 월 10만원 추가지원",
    },
    amountLabel: "첫 3개월 월 100만원",
    duration: "해당 기간",
    applicationCycle: "신청 후 지급",
    exclusions: [],
    notes: ["남성 육아휴직 시 월 10만원 추가 지원"],
    tags: ["육아휴직", "남성육아", "우선지원"],
    highlight: true,
  },

  // ─── 고용유지지원금 ───────────────────────────────────────
  {
    id: "employment-maintenance",
    category: "고용유지지원금",
    name: "고용유지지원금",
    description:
      "경영 사정이 악화되어 감원 등 고용조정이 필요한 상황에서 휴직·휴업 등을 실시하고, 해당 기간 동안 근로자에게 임금 또는 수당을 지급하며 고용을 유지한 사업주에게 지원합니다.",
    requirements: [
      "경영 사정 악화로 고용조정이 필요한 상황",
      "휴직, 휴업 등 실시",
      "해당 기간 동안 근로자에게 임금 또는 수당 지급",
      "고용유지조치 기간 및 그 이후 1개월까지 사업장 소속 근로자를 이직시키지 않은 경우",
    ],
    amount: {
      우선지원대상기업: "휴업지원금: 휴업수당의 2/3 (1일 6.6만원 한도, 고용위기지역 7만원 한도) / 휴직지원금: 휴직수당의 2/3",
      중견기업: "휴업수당의 1/2~2/3 / 휴직수당의 1/2~2/3",
      대규모기업: "휴업수당의 1/2~2/3 (단, 이상 인원 경우 휴업수당의 2/3)",
    },
    amountLabel: "휴업수당의 2/3",
    duration: "고용유지조치 기간",
    applicationCycle: "신청 후 지급",
    exclusions: [],
    notes: [
      "1일 6.6만원 한도 (고용위기지역 7만원 한도)",
      "50% 단, 이상 근로시간 단축률 경우 휴업수당의 2/3",
    ],
    tags: ["고용유지", "휴업", "경영위기"],
  },
  {
    id: "unpaid-leave",
    category: "고용유지지원금",
    name: "무급 휴업·휴직 고용유지지원금",
    description:
      "경영 사정이 악화되어 심사위원회의 심사를 거쳐 무급휴업 또는 무급휴직을 실시하는 경우 지원합니다.",
    requirements: [
      "경영 사정 악화로 고용조정이 필요한 상황",
      "심사위원회의 심사를 거쳐 무급휴업 또는 무급휴직 실시",
    ],
    amount: {
      공통: "근로자 평균임금의 50% 범위 내 (1일 6.6만원/최대 180일 한도) / 사업주: 근로자 1인당 월 10만원",
    },
    amountLabel: "평균임금 50% 범위 내",
    duration: "최대 180일",
    applicationCycle: "신청 후 지급",
    exclusions: [],
    notes: ["근로자 직업능력 관련 교육 실시 시 사업주에게 근로자 1인당 월 10만원 추가 지원"],
    tags: ["무급휴업", "무급휴직", "경영위기"],
  },

  // ─── 청년고용장려금 ───────────────────────────────────────
  {
    id: "youth-employment",
    category: "청년고용장려금",
    name: "청년 일자리 도약 장려금",
    description:
      "5인 이상 중소기업 등에서 취업애로청년을 정규직으로 채용 후 6개월 이상 고용유지하는 경우 지원합니다.",
    requirements: [
      "5인 이상 중소기업 (성장유망업종, 미래유망기업, 고용위기지역 소재 기업 등은 5인 미만도 가능)",
      "취업애로청년을 정규직으로 채용",
      "6개월 이상 고용유지",
    ],
    amount: {
      우선지원대상기업: "신규채용 청년 1인당 월 최대 60만원",
    },
    amountLabel: "월 최대 60만원",
    duration: "신규채용 청년 1인당 1년 지원",
    applicationCycle: "신청 후 지급",
    exclusions: [],
    notes: [
      "피보험자 수의 50%(비수도권 지역 100%), 단 최대 30명",
    ],
    tags: ["청년", "정규직", "취업애로청년"],
    highlight: true,
  },

  // ─── 장년고용장려금 ───────────────────────────────────────
  {
    id: "elderly-employment",
    category: "장년고용장려금",
    name: "고령자 고용지원금",
    description:
      "지원금 신청 분기의 월평균 고령자 수가 직전 3년간 월평균 고령자 수보다 증가한 경우 지원합니다.",
    requirements: [
      "지원금 신청 분기의 월평균 고령자(무기계약 또는 고용기간이 1년 초과하는 만 60세 이상 근로자) 수 증가",
      "지원금 최초 신청 직전분기 이전 3년간 월평균 고령자 수보다 증가",
    ],
    amount: {
      공통: "고령자 수 증가 1인당 분기별 30만원",
    },
    amountLabel: "분기별 30만원/인",
    duration: "고령자 수 증가 1인당 2년 지원",
    applicationCycle: "분기별 신청",
    exclusions: [],
    notes: ["만 60세 이상 무기계약 또는 고용기간 1년 초과 근로자"],
    tags: ["고령자", "60세이상", "분기신청"],
  },
  {
    id: "continued-employment",
    category: "장년고용장려금",
    name: "고령자 계속고용 장려금",
    description:
      "정년제도를 운영하는 사업장 중 정년 도달 근로자에 대해 정년연장, 정년폐지, 또는 재고용 등 계속고용제도를 도입한 기업에 지원합니다.",
    requirements: [
      "정년제도를 운영하는 사업장",
      "정년연장, 정년폐지, 또는 정년 도달자를 재고용으로 1년 이상 계속고용",
      "계속고용제도 시행일(2020.1.1 이후)로부터 2년간 지원",
    ],
    amount: {
      공통: "계속고용인원 1인당 월 30만원",
    },
    amountLabel: "월 30만원/인",
    duration: "계속고용제도 시행일로부터 2년",
    applicationCycle: "신청 후 지급",
    exclusions: [
      "대기업, 공공기관, 지방공기업",
      "고용보험 피보험자수 100인 이상 기업 중 전체 피보험자수 중 60세 이상이 20% 초과하는 경우",
    ],
    notes: ["계속고용제도 시행일(2020.1.1 이후)로부터 2년간 지원"],
    tags: ["고령자", "정년연장", "계속고용"],
  },

  // ─── 고용환경개선장려금 ───────────────────────────────────
  {
    id: "daycare-center",
    category: "고용환경개선장려금",
    name: "직장어린이집 인건비 및 운영비 지원",
    description:
      "직장내어린이집을 설치하고 보육교사를 고용한 경우 인건비 및 운영비를 지원합니다.",
    requirements: [
      "직장내어린이집 설치",
      "보육교사 고용",
    ],
    amount: {
      공통: "직장어린이집 인건비 + 중소직장어린이집 운영비",
    },
    amountLabel: "인건비 + 운영비",
    duration: "해당 기간",
    applicationCycle: "신청 후 지급",
    exclusions: [],
    notes: ["규모별 상이한 지원금액 적용"],
    tags: ["어린이집", "보육", "인건비"],
  },
  {
    id: "daycare-installation",
    category: "고용환경개선장려금",
    name: "직장어린이집 설치비 지원",
    description:
      "직장어린이집 또는 여성고용친화시설(수유시설, 탈의실, 휴게실, 수면실 등)을 설치하고자 하는 경우 무상지원합니다.",
    requirements: [
      "직장어린이집 또는 여성고용친화시설 설치 계획",
    ],
    amount: {
      공통: "무상지원",
    },
    amountLabel: "무상지원",
    duration: "설치 시 1회",
    applicationCycle: "신청 후 지급",
    exclusions: [],
    notes: ["수유시설, 탈의실, 휴게실, 수면실 등 포함"],
    tags: ["어린이집", "설치비", "무상지원"],
  },
  {
    id: "elderly-facility",
    category: "고용환경개선장려금",
    name: "고령자 고용환경 개선자금 융자",
    description:
      "고령자 친화적 시설 또는 장비의 설치·개선·교체·구입비용을 융자 지원합니다.",
    requirements: [
      "고령자 친화적 시설 또는 장비 설치·개선·교체·구입",
      "융자금 1억 원당 1명의 (준)고령자 신규 고용 조건",
    ],
    amount: {
      공통: "사업주당 10억 원 한도, 3년 거치 5년 균등분할 상환",
    },
    amountLabel: "최대 10억원 융자",
    duration: "3년 거치 5년 균등분할 상환",
    applicationCycle: "신청 후 지급",
    exclusions: ["퇴직 후 6개월 이내 재고용 시 신규고용인원으로 인정하지 않음"],
    notes: ["융자금 1억 원당 1명의 (준)고령자 신규 고용 조건"],
    tags: ["고령자", "시설개선", "융자"],
  },

  // ─── 장애인고용 ───────────────────────────────────────────
  {
    id: "disability-employment",
    category: "장애인고용",
    name: "장애인 고용 장려금",
    description:
      "월별 상시근로자의 의무고용률을 초과하여 장애인을 고용하고, 해당 근로자가 최저임금 이상을 받는 경우 지원합니다.",
    requirements: [
      "월별 상시근로자의 의무고용률을 초과하여 장애인 고용",
      "해당 근로자가 최저임금 이상 또는 최저임금적용제외 인가를 받은 경우",
      "장애인 근로자 2인 이상 고용 시부터 지원",
    ],
    amount: {
      공통: "장애인 근로자 1명당 중증여부 및 성별에 따라 월 35~90만원",
    },
    amountLabel: "월 35~90만원/인",
    duration: "해당 기간",
    applicationCycle: "신청 후 지급",
    exclusions: [],
    notes: ["중증 여부 및 성별에 따라 지원금액 차등"],
    tags: ["장애인", "의무고용", "중증장애"],
  },
  {
    id: "disability-new-hire",
    category: "장애인고용",
    name: "장애인 신규 고용장려금",
    description:
      "장애인 고용 의무가 없는 5인 이상 50인 미만 사업주가 2022년 1월 1일 이후 장애인 근로자를 신규 고용하여 6개월 이상 고용 유지한 경우 지급합니다.",
    requirements: [
      "장애인 고용 의무가 없는 상시근로자 수 5인 이상 50인 미만 사업주",
      "2022년 1월 1일 이후 장애인 근로자를 신규 고용",
      "6개월 이상 고용 유지",
    ],
    amount: {
      공통: "장애인 근로자 1명당, 6개월 또는 1년 단위 지원, 중증도·성별에 따라 30~80만원",
    },
    amountLabel: "월 30~80만원/인",
    duration: "6개월 또는 1년 단위",
    applicationCycle: "신청 후 지급",
    exclusions: ["타지원금과 중복될 경우 차감하여 지급, 타 지원금이 본 지원금보다 크거나 같은 경우 미지급"],
    notes: ["중증도, 성별에 따라 30~80만원"],
    tags: ["장애인", "신규고용", "소규모사업장"],
  },

  // ─── 지역고용촉진지원금 ──────────────────────────────────
  {
    id: "regional-employment",
    category: "지역고용촉진지원금",
    name: "고용위기지역고용촉진지원금",
    description:
      "고용위기지역으로 사업 이전, 신설/증설 후 해당 지역 3개월 이상 거주자를 6개월 이상 채용한 경우 지원합니다.",
    requirements: [
      "고용위기지역으로 사업 이전, 신설 또는 증설",
      "해당 지역 3개월 이상 거주자를 6개월 이상 채용",
    ],
    amount: {
      우선지원대상기업: "근로자 1명당 월 통상임금의 1/2",
      중견기업: "근로자 1명당 월 통상임금의 1/3",
    },
    amountLabel: "월 통상임금의 1/2",
    duration: "해당 기간",
    applicationCycle: "신청 후 지급",
    exclusions: [],
    notes: [],
    tags: ["고용위기지역", "지역이전", "통상임금"],
  },

  // ─── 정규직전환지원 ──────────────────────────────────────
  {
    id: "regular-conversion",
    category: "정규직전환지원",
    name: "정규직 전환 지원금",
    description:
      "6개월 이상 근속한 기간제/파견/사내하도급 근로자를 정규직으로 전환(정년 2년 이상 잔존)하고 1개월 이상 고용한 경우 지원합니다.",
    requirements: [
      "6개월 이상 근속한 기간제, 파견, 사내하도급 근로자",
      "정규직으로 전환 (정년 2년 이상 잔존)",
      "전환 후 1개월 이상 고용",
      "임금 증가 20만원 이상",
      "30인 미만 중소기업만 참여 가능",
      "사업장 피보험자수의 30%까지 지원",
    ],
    amount: {
      우선지원대상기업: "월 40만원 (임금 증가 20만원 이상 시 월 60만원)",
    },
    amountLabel: "월 최대 60만원",
    duration: "최대 1년",
    applicationCycle: "분기별 지급",
    exclusions: [],
    notes: [
      "30인 미만 중소기업만 참여 가능",
      "임금 증가 20만원 이상 시 월 60만원",
    ],
    tags: ["정규직전환", "비정규직", "소규모사업장"],
    highlight: true,
  },
];

// 카테고리별 색상 매핑
export const categoryColors: Record<SubsidyCategory, { bg: string; border: string; text: string; badge: string }> = {
  고용창출장려금: {
    bg: "rgba(59, 130, 246, 0.08)",
    border: "rgba(59, 130, 246, 0.25)",
    text: "#93C5FD",
    badge: "badge-category",
  },
  고용안정장려금: {
    bg: "rgba(16, 185, 129, 0.08)",
    border: "rgba(16, 185, 129, 0.25)",
    text: "#6EE7B7",
    badge: "badge-eligible",
  },
  고용유지지원금: {
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.25)",
    text: "#FCD34D",
    badge: "badge-warning",
  },
  청년고용장려금: {
    bg: "rgba(139, 92, 246, 0.08)",
    border: "rgba(139, 92, 246, 0.25)",
    text: "#C4B5FD",
    badge: "badge-category",
  },
  장년고용장려금: {
    bg: "rgba(236, 72, 153, 0.08)",
    border: "rgba(236, 72, 153, 0.25)",
    text: "#F9A8D4",
    badge: "badge-category",
  },
  고용환경개선장려금: {
    bg: "rgba(20, 184, 166, 0.08)",
    border: "rgba(20, 184, 166, 0.25)",
    text: "#5EEAD4",
    badge: "badge-eligible",
  },
  장애인고용: {
    bg: "rgba(249, 115, 22, 0.08)",
    border: "rgba(249, 115, 22, 0.25)",
    text: "#FDBA74",
    badge: "badge-warning",
  },
  지역고용촉진지원금: {
    bg: "rgba(6, 182, 212, 0.08)",
    border: "rgba(6, 182, 212, 0.25)",
    text: "#67E8F9",
    badge: "badge-category",
  },
  정규직전환지원: {
    bg: "rgba(132, 204, 22, 0.08)",
    border: "rgba(132, 204, 22, 0.25)",
    text: "#BEF264",
    badge: "badge-eligible",
  },
};

// 카테고리 목록
export const categories: SubsidyCategory[] = [
  "고용창출장려금",
  "고용안정장려금",
  "고용유지지원금",
  "청년고용장려금",
  "장년고용장려금",
  "고용환경개선장려금",
  "장애인고용",
  "지역고용촉진지원금",
  "정규직전환지원",
];

// 통계 데이터
export const subsidyStats = {
  totalPrograms: subsidyData.length,
  maxMonthlyAmount: "월 최대 140만원",
  categories: categories.length,
  targetCompanies: "우선지원대상기업 중심",
};
