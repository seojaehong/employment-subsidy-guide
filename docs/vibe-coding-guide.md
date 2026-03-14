# MVP_V1 Vibe Coding Guide

이 문서는 `repo_review`를 앞으로 계속 개발할 때 빠르게 감을 맞추기 위한 실전 가이드다.

현재 제품 기준선은 `MVP_V1`이다.

핵심 목적:
- 고용장려금 탐색
- 자격 자가진단
- 결과 해석
- 준비 패키지
- 상담 전환

이 다섯 흐름이 자연스럽게 하나로 이어지는 것이 최우선이다.

## 1. 지금 제품을 한 줄로 정의하면

이 사이트는 `지원금 신청을 대신하는 도구`가 아니라, `신청 가능성과 준비 방향을 빠르게 정리해주는 진단형 제품`이다.

절대 흐리면 안 되는 포지션:
- 자동 제출 서비스 아님
- 정부 접수 대행 서비스 아님
- 승인 확정 엔진 아님

끝까지 유지해야 하는 포지션:
- 빠른 1차 판단
- 준비 순서 정리
- 필요한 경우 전문가 후속 검토 연결

## 2. MVP_V1 범위

MVP_V1에 포함된 핵심 화면:
- 홈
- 지원금 목록
- 지원금 상세
- 지원금 비교
- `/check`
- `/prepare`
- 상담 폼
- 관리자 최소 운영 화면

MVP_V1에서 이미 합의된 상태 체계:
- `신청 가능`
- `조금 더 확인 필요`
- `조건 다시 확인`
- `추가 확인 필요`

이 상태는 함부로 늘리거나 다른 이름으로 바꾸지 않는다.

## 3. 가장 중요한 UX 원칙

### 결과는 판정이 아니라 안내처럼 보여야 한다
- 사용자가 심사받는 느낌을 받으면 안 된다.
- `불가`, `제외`, `미달` 같은 단정형 표현은 최대한 피한다.
- `현재 기준`, `추가 확인`, `먼저 챙길 항목`, `다음 순서` 중심으로 쓴다.

### 상담은 영업이 아니라 후속 진행처럼 보여야 한다
- 같은 결과를 길게 다시 나열하지 않는다.
- 로그처럼 긴 한 줄 문장을 만들지 않는다.
- 사용자가 `왜 상담이 필요한지`를 납득할 수 있어야 한다.

### 준비 패키지는 공식 신청서처럼 보이면 안 된다
- `준비용 초안`, `체크리스트`, `PDF 정리본` 포지션 유지
- 실제 제출 전 직접 확인이 필요한 항목을 항상 분리해서 보여준다.

### 한국어 줄바꿈은 반드시 자연스러워야 한다
- 음절 단위 줄바꿈 금지
- 카드/버튼/뱃지에서 단어가 중간에 끊기지 않게 유지
- 전역 규칙은 [index.css](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\index.css)에서 관리

## 4. 수정 우선순위

기능을 추가할 때는 아래 순서로 판단한다.

1. `/check` 흐름이 더 신뢰감 있게 되는가
2. 사용자가 다음 행동을 더 쉽게 이해하는가
3. 네트워크/로딩을 더 무겁게 만들지 않는가
4. 상담 전환의 품질을 해치지 않는가
5. 운영자가 나중에 설명 가능한가

예쁘지만 제품을 흐리는 수정은 뒤로 미룬다.

## 5. 파일별 감각 지도

### 공개 표면
- [Home.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\Home.tsx)
- [SubsidyList.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\SubsidyList.tsx)
- [SubsidyDetail.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\SubsidyDetail.tsx)
- [SubsidyCompare.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\SubsidyCompare.tsx)

여기서는 `무슨 사이트인지`, `왜 볼 가치가 있는지`, `어디로 들어가야 하는지`가 핵심이다.

### 자격검토
- [EligibilityCheck.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\EligibilityCheck.tsx)
- [shared/subsidy.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\shared\subsidy.ts)
- [lib.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\server\api\eligibility\lib.ts)

여기서는 `질문 순서`, `상태 해석`, `결과 카드 구조`, `낙관적 전환`이 핵심이다.

### 준비 패키지
- [ApplicationDraft.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\ApplicationDraft.tsx)

여기서는 `어디까지 자동화되는지`와 `어디부터 직접 확인해야 하는지`를 같이 보여줘야 한다.

### 상담 전환
- [ConsultationForm.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\components\ConsultationForm.tsx)
- [consultation-leads.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\api\consultation-leads.ts)

여기서는 `짧고 명확한 신뢰`, `결과 요약의 시각적 분리`, `후속 진행 안내`가 핵심이다.

### 운영
- [AdminDashboard.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\AdminDashboard.tsx)
- [AdminDocumentDetail.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\AdminDocumentDetail.tsx)
- [admin-lib.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\server\api\admin-lib.ts)
- [admin-seed.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\server\api\admin-seed.ts)

여기서는 `운영자 해석 가능성`, `질문/규칙/게시 일관성`, `상담 큐 가독성`이 핵심이다.

## 6. 지금까지 자주 맞닥뜨린 함정

### 함정 1. DB에서 질문 순서가 바뀌는 문제
- 질문은 로컬 기본 순서와 같아야 한다.
- DB에서 읽더라도 순서를 다시 보정해야 한다.
- 기준 파일: [lib.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\server\api\eligibility\lib.ts)

### 함정 2. 프리뷰와 운영 환경이 다르게 보이는 문제
- Preview와 Production 환경변수를 항상 같이 확인
- 특히 EmailJS는 Preview/Production 분리 여부 꼭 확인

### 함정 3. `/check`가 느려지는 문제
- 추가 fetch를 함부로 넣지 않는다.
- 가능하면 로컬 fallback이나 기존 세션 데이터를 먼저 활용
- 같은 데이터 중복 호출을 피한다.

### 함정 4. 문구가 다시 보고서처럼 굳는 문제
- `근거 요약`, `보완 필요`, `다음 행동` 같은 내부 보고서 말투를 경계
- 사용자는 실무자이지 심사관이 아님

## 7. 새 기능 추가 전 체크 질문

새 기능을 넣기 전에 아래 질문에 답해본다.

1. 이 기능이 `탐색 -> 진단 -> 준비 -> 상담` 흐름 중 어디를 강화하는가
2. 결과 신뢰를 높이는가, 아니면 정보량만 늘리는가
3. 사용자가 지금 뭘 해야 하는지 더 쉬워지는가
4. 운영자가 나중에 설명하거나 수정할 수 있는가
5. Preview와 Production에서 같은 동작을 보장할 수 있는가

이 질문에 약하면 아직 넣지 않는 편이 낫다.

## 8. 빠른 작업 루틴

### UI 수정 후
- 줄바꿈 이상한지 보기
- 카드 높이/정렬 흔들리는지 보기
- 같은 의미 반복하는지 보기

### 로직 수정 후
- 질문 순서 안 깨졌는지 보기
- 상태 라벨이 의도와 맞는지 보기
- `prepare` 가능 조건이 같이 흔들리지 않는지 보기

### 배포 전
- `npm.cmd run check`
- 프리뷰에서 `/check`
- 프리뷰에서 `/prepare`
- 상담 제출
- 관리자 큐 확인

## 9. 바로 써먹을 개발 방향

다음 개발은 아래 우선순위가 좋다.

1. 운영 배포 안정화
2. 전체 제도 상태 정책 마지막 정규화
3. 준비 패키지 출력 품질 개선
4. 관리자 운영 큐/상태 관리 강화
5. 공개 표면의 신뢰 표현 정리

## 10. 절대 잊지 말 것

이 제품은 `화려한 사이트`보다 `신뢰되는 도메인 툴`처럼 보여야 한다.

좋은 수정의 기준:
- 더 빠르다
- 더 자연스럽다
- 더 믿을 만하다
- 다음 행동이 더 분명하다

애매한 수정의 기준:
- 보기엔 바뀌었지만 사용자는 덜 편해진다
- 정보는 늘었지만 이해는 더 어려워진다
- 코드만 복잡해지고 흐름은 더 무거워진다
