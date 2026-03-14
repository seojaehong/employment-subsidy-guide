# PR Draft: Automation Expansion After MVP_V1

## PR Title

Automation Expansion Plan for Post-MVP_V1

## Background

MVP_V1은 아래 흐름을 기준으로 확정됐다.

- 지원금 탐색
- 자격 자가진단
- 결과 해석
- 준비 패키지
- 상담 전환

현재 제품은 `판단과 준비를 도와주는 진단형 제품`으로는 충분히 성립한다.

다음 단계 자동화는 `실제 제출 대행`이 아니라, `준비 자동화`와 `운영 자동화`를 더 깊게 만드는 방향으로 진행하는 것이 맞다.

## Why Now

현재 구조에는 이미 자동화 확장을 위한 기반이 있다.

- 자격검토 세션
- 판정 결과 저장
- 준비 패키지 라우트
- 상담 lead 저장
- 관리자 게시/운영 체계

즉 완전히 새 제품을 만드는 것이 아니라, 지금 있는 흐름을 더 자동화 친화적으로 고도화하는 단계다.

## Product Goal

다음 자동화 단계의 목표는 아래와 같다.

1. 결과를 본 사용자가 준비를 더 빨리 시작할 수 있게 한다.
2. 운영자가 상담 이후 후속 작업을 덜 수작업으로 처리하게 한다.
3. 자동화 범위와 사람 검토 범위를 명확히 구분해 신뢰를 유지한다.

## Non-Goal

이번 자동화 확장에서 하지 않을 것:

- 정부 시스템 직접 제출 자동화
- 승인 가능성 확정 엔진
- 실제 신청 대행처럼 보이는 UX
- OCR 기반 증빙 판독의 정식 제품화

## Recommended Automation Scope

### L1. 준비 자동화 강화

가장 먼저 붙이기 좋은 영역이다.

목표:
- 준비 패키지를 더 실무적으로 만든다.
- 결과를 본 직후 바로 정리 가능한 산출물을 늘린다.

가능 기능:
- 지원금별 준비 체크리스트 자동 생성
- 보완 항목별 다음 행동 자동 정리
- 결과 기반 PDF 묶음 품질 개선
- 선택 제도별 준비 순서 정렬

기술 방식:
- 기존 [ApplicationDraft.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\ApplicationDraft.tsx) 확장
- [shared/subsidy.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\shared\subsidy.ts)의 상태/보완항목 활용
- 서버 추가 없이도 1차 구현 가능

### L2. 상담 후속 자동화

운영 효율이 크게 좋아지는 구간이다.

목표:
- 상담 요청 이후 운영자의 판단과 다음 액션을 더 빠르게 만든다.

가능 기능:
- lead 우선순위 자동 분류
- 보완 항목 기반 triage
- 상태별 후속 템플릿 생성
- 상담 요청 후 내부 메모/상태 컬럼 추가

기술 방식:
- [consultation-leads.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\api\consultation-leads.ts) 저장 데이터 활용
- [AdminDashboard.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\AdminDashboard.tsx) 운영 큐 확장
- [admin-lib.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\server\api\admin-lib.ts)에 최소 상태 필드 추가

### L3. 규칙/운영 자동화

이건 제품 품질 안정화와 운영 확장성 측면에서 중요하다.

목표:
- 질문/규칙/게시 흐름의 수작업 실수를 줄인다.

가능 기능:
- 질문 순서 검증 자동화
- publish 전 운영 검증 체크
- 상태 정책 위반 감지
- Preview/Production 배포 전 smoke 기준 자동 점검

기술 방식:
- [admin-seed.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\server\api\admin-seed.ts)
- [lib.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\server\api\eligibility\lib.ts)
- [eligibility-smoke.spec.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\e2e\eligibility-smoke.spec.ts)
- 운영용 체크리스트 문서

## Technical Assessment

### Technically Safe Right Now

즉시 개발 가능한 영역:
- 준비 패키지 고도화
- 상담 lead triage
- 운영 검증 자동화
- 상태/보완 항목 기반 후속 텍스트 생성

이유:
- 데이터 구조가 이미 존재한다.
- 현재 제품 목적과도 일치한다.
- 제출 자동화보다 리스크가 낮다.

### Technically Possible But Needs Care

조건부로 가능한 영역:
- 파일 업로드 기반 증빙 체크 보조
- 서류 패키지 자동 생성 고도화
- 후속 상태 머신

주의점:
- 파일 구조와 예외 케이스가 많아진다.
- 운영자 워크플로우를 함께 설계해야 한다.

### Technically Possible But Not Recommended for Next PR

다음 PR 범위에서는 제외 권장:
- 외부 사이트 자동 입력
- 정부 시스템 제출 봇
- 승인 여부 확정 판단 엔진

이유:
- 기술보다 운영/정책 리스크가 더 크다.
- 현재 제품 포지션과도 어긋난다.

## Proposed Delivery Sequence

### PR 1. Prepare Package Plus

범위:
- 지원금별 준비 체크리스트 강화
- 보완 항목 자동 정렬
- 패키지 출력 품질 개선

완료 기준:
- 사용자가 `/prepare`에서 바로 실무용 정리본을 만들 수 있다.

### PR 2. Consultation Ops

범위:
- lead 우선순위
- 최근 상담 요청 상세 보기
- 후속 상태 컬럼

완료 기준:
- 운영자가 메일함만 보지 않고도 관리자에서 1차 triage 가능

### PR 3. Rules and Release Reliability

범위:
- 질문 순서 검증
- publish 후 공개 검증
- 상태 체계 일관성 자동 점검

완료 기준:
- 운영 실수로 공개 UX가 흔들릴 확률이 줄어든다.

## Success Metrics

자동화 확장 성공 기준:

- `/prepare` 진입 후 이탈 감소
- 상담 제출 후 운영 처리 시간 감소
- `manual_review` 과다 비율 감소
- 질문 순서/배포 불일치 이슈 감소
- 운영자가 수작업으로 정리하는 반복 메모 감소

## Risks

주의할 리스크:

- 자동화가 과해져 제품이 `대행 서비스`처럼 보일 수 있음
- 준비 패키지가 공식 신청서처럼 읽힐 수 있음
- 운영 상태 필드가 늘어나며 관리자 UX가 복잡해질 수 있음
- 규칙 자동화가 오히려 질문 순서를 또 꼬이게 만들 수 있음

## Guardrails

다음 자동화 PR에서도 꼭 지킬 것:

- `신청 가능 / 조금 더 확인 필요 / 조건 다시 확인 / 추가 확인 필요` 상태 체계 유지
- `/check` 성능을 해치는 네트워크 추가 최소화
- 상담은 영업 압박형으로 바꾸지 않기
- 자동화 결과는 항상 `참고용 + 준비용` 포지션 유지

## Decision

다음 자동화 확장은 아래 방향으로 진행한다.

- 우선순위 1: 준비 자동화
- 우선순위 2: 상담 후속 운영 자동화
- 우선순위 3: 게시/운영 신뢰 자동화

이번 문서는 `자동 제출`이 아니라 `준비와 운영의 자동화`를 다음 확장 기준으로 확정하기 위한 PR 초안이다.
