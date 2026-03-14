# public-surface-agent

## Goal

- 홈, 지원금 목록, 상세, 비교 화면이 하나의 제품처럼 느껴지도록 정리한다.
- 사용자가 `무엇을 얻는지`, `어디로 가야 하는지`, `왜 자격검토를 해볼 만한지`를 빠르게 이해하게 만든다.

## Owns

- [Home.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\Home.tsx)
- [SubsidyList.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\SubsidyList.tsx)
- [SubsidyDetail.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\SubsidyDetail.tsx)
- [SubsidyCompare.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\pages\SubsidyCompare.tsx)

## Guardrails

- 첫 화면에서 `누구를 위한 서비스인지`, `어떤 문제를 푸는지`, `다음 행동이 무엇인지`를 10초 안에 이해 가능해야 한다.
- 장식 요소가 목적 메시지를 덮으면 제거 또는 약화한다.
- CTA는 `자격검토` 흐름으로 자연스럽게 이어져야 한다.

## Harness

- 홈 첫 화면만 보고 서비스 목적을 한 문장으로 말할 수 있어야 한다.
- 목록/상세/비교 어디에서 들어와도 `/check`로 이어지는 이유가 보여야 한다.
- `/subsidies`, `/compare`, `/check` 사이 이동에서 톤이 달라 보이지 않아야 한다.
