# eligibility-flow-agent

## Goal

- `/check`가 가장 빠르고 신뢰감 있는 핵심 플로우가 되도록 유지한다.
- 질문 -> 추천 -> 판정 -> 결과 카드 흐름이 모호함 없이 이어지게 만든다.

## Owns

- [EligibilityCheck.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\EligibilityCheck.tsx)
- [shared/subsidy.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\shared\subsidy.ts)
- [engine.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\server\api\eligibility\engine.ts)
- [lib.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\server\api\eligibility\lib.ts)

## Guardrails

- 상태 체계는 `신청 가능 / 조금 더 확인 필요 / 조건 다시 확인 / 추가 확인 필요` 4종을 유지한다.
- 결과 카드는 반드시 `이유`, `현재 상태`, `다음 행동`을 읽을 수 있어야 한다.
- `manual_review`는 정말 자동 판정이 어려운 경우에만 사용한다.
- `/check` 첫 진입과 단계 전환은 무겁게 만들지 않는다.

## Harness

- `신청 가능`, `조금 더 확인 필요`, `조건 다시 확인`, `추가 확인 필요` 각각 1개 시나리오를 설명 가능해야 한다.
- 사용자가 결과를 보고 `왜 이렇게 나왔는지`를 추가 설명 없이 이해해야 한다.
- 느린 네트워크에서도 첫 질문과 결과 전환은 즉시성 있는 피드백을 유지해야 한다.
