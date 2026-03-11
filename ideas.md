# 2026 고용장려금 가이드 — 디자인 아이디어

## 참고 레퍼런스
- **토스(toss.im)**: 심플하고 신뢰감 있는 한국형 핀테크 UI, 큰 타이포그래피, 여백 활용
- **OpenAI Codex**: 다크 테마, 터미널/코드 UI 모티프, 글로우 효과, 섹션별 강렬한 비주얼

---

<response>
<idea>
**Design Movement**: Dark Fintech Minimal — OpenAI Codex × 토스의 교차점

**Core Principles**:
1. 신뢰와 전문성 — 짙은 네이비/차콜 배경에 선명한 화이트 타이포그래피로 공신력 표현
2. 정보 계층의 명확성 — 지원금 종류별 카드 시스템으로 복잡한 정보를 직관적으로 분류
3. 행동 유도 중심 — 각 섹션마다 명확한 CTA, "지금 신청 가능 여부 확인" 플로우
4. 한국 공공 서비스의 신뢰감 + 스타트업의 세련됨 융합

**Color Philosophy**:
- 배경: `#0A0E1A` (딥 네이비 블랙) — 권위와 신뢰
- 주 강조색: `#3B82F6` (밝은 블루) → `#60A5FA` 그라디언트 — 정부/공공 연상
- 보조 강조: `#10B981` (에메랄드 그린) — 승인/적합 상태 표현
- 경고/제외: `#F59E0B` (앰버) — 주의 조건 표현
- 텍스트: `#F8FAFC` (거의 흰색), `#94A3B8` (서브텍스트)
- 카드 배경: `rgba(255,255,255,0.04)` 글래스모피즘

**Layout Paradigm**:
- 좌우 비대칭 레이아웃 — 왼쪽 텍스트 + 오른쪽 시각 요소
- 스크롤 기반 스토리텔링 — 스크롤할수록 지원금 정보가 순차적으로 드러남
- 사이드바 네비게이션 (데스크탑) + 상단 탭 (모바일)
- 카드 그리드: 지원금 카테고리별 3열 레이아웃

**Signature Elements**:
1. 글로우 배지 — 지원금 금액을 큰 숫자로 강조, 배경에 블루 글로우 효과
2. 터미널 스타일 자격요건 체크리스트 — Codex 참고, 체크 항목이 순차적으로 활성화
3. 수평 스크롤 카드 캐러셀 — 지원금 종류를 좌우로 탐색

**Interaction Philosophy**:
- 호버 시 카드가 살짝 부상(translateY -4px) + 테두리 글로우
- 자격 검토 체크박스 선택 시 실시간 지원 가능 금액 합산 표시
- 스크롤 진행 바로 현재 위치 인식

**Animation**:
- 섹션 진입 시 fade-in + slide-up (framer-motion)
- 숫자 카운트업 애니메이션 (지원금 금액)
- 카드 스태거 애니메이션 (0.1s 간격으로 순차 등장)
- 배경 그라디언트 미세 이동 (ambient animation)

**Typography System**:
- 헤드라인: `Pretendard` (한국어 최적화) Bold 700-900, 크기 48-72px
- 서브헤드: `Pretendard` SemiBold 600, 24-32px
- 본문: `Pretendard` Regular 400, 16px, line-height 1.7
- 숫자/금액: `Pretendard` ExtraBold 800, 모노스페이스 느낌
- 영문 보조: `DM Sans` — 레이블, 배지, 태그
</idea>
<probability>0.08</probability>
</response>

<response>
<idea>
**Design Movement**: Light Editorial Fintech — 토스 스타일 라이트 테마

**Core Principles**:
1. 밝고 접근하기 쉬운 — 흰색 배경, 파스텔 강조색
2. 정보 밀도 조절 — 아코디언과 탭으로 복잡성 숨김
3. 신뢰 시그널 — 노무법인 브랜딩, 공식 문서 느낌

**Color Philosophy**:
- 배경: 순백 `#FFFFFF`
- 강조: 토스 블루 `#0064FF`
- 카드: `#F5F7FA`

**Layout Paradigm**:
- 중앙 정렬 단일 컬럼
- 섹션별 배경색 교차

**Signature Elements**:
1. 토스 스타일 큰 숫자 강조
2. 심플한 아이콘 시스템

**Interaction Philosophy**:
- 탭 전환으로 카테고리 이동
- 부드러운 스크롤

**Animation**:
- 미니멀 fade-in

**Typography System**:
- Pretendard 전체 사용
</idea>
<probability>0.06</probability>
</response>

<response>
<idea>
**Design Movement**: Glassmorphism Dark Premium — Codex 스타일 완전 다크

**Core Principles**:
1. 프리미엄 AI 서비스 느낌
2. 글래스모피즘 카드
3. 네온 강조색

**Color Philosophy**:
- 완전 블랙 배경
- 퍼플/블루 네온

**Layout Paradigm**:
- 풀스크린 섹션
- 파티클 배경

**Signature Elements**:
1. 네온 글로우 텍스트
2. 3D 요소

**Interaction Philosophy**:
- 마우스 패럴랙스

**Animation**:
- 파티클 시스템

**Typography System**:
- Space Grotesk + Pretendard
</idea>
<probability>0.07</probability>
</response>

---

## 선택된 디자인: Dark Fintech Minimal (첫 번째 안)

**이유**: OpenAI Codex의 다크 테마 권위감 + 토스의 명확한 정보 전달력을 결합하여,
고용장려금이라는 복잡한 공공 정보를 세련되고 신뢰감 있게 전달하기에 가장 적합함.
