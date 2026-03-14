# Project Agents

이 프로젝트는 `고용장려금 탐색 -> 자격 자가진단 -> 후속 상담 전환` 흐름을 중심으로 운영한다.

## 기본 원칙

- 모든 공개 UX 변경은 [docs/pm-95-rubric.md](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\docs\pm-95-rubric.md)를 기준으로 판단한다.
- 공개 화면에서는 `신뢰`, `전환`, `성능`, `운영 일관성`을 시각 미감보다 우선한다.
- 자격검토 상태 체계 `신청 가능 / 조금 더 확인 필요 / 조건 다시 확인 / 추가 확인 필요`를 임의로 늘리거나 흐리게 만들지 않는다.
- 상담 UX는 영업 압박형 문구를 피하고, 결과를 반복 나열하지 않는다.
- `/check` 흐름을 무겁게 만드는 네트워크 추가는 매우 신중히 다룬다.

## Agent Catalog

- `public-surface-agent`
  - 홈, 목록, 상세, 비교 페이지의 메시지 구조와 탐색 흐름을 담당한다.
  - 기준 문서: [docs/agents/public-surface-agent.md](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\docs\agents\public-surface-agent.md)
- `eligibility-flow-agent`
  - `/check` 질문, 상태 체계, 결과 카드, 낙관적 전환 UX를 담당한다.
  - 기준 문서: [docs/agents/eligibility-flow-agent.md](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\docs\agents\eligibility-flow-agent.md)
- `consultation-conversion-agent`
  - 상담 박스, 요약 구조, EmailJS/lead 저장 흐름, 후속 전환 카피를 담당한다.
  - 기준 문서: [docs/agents/consultation-conversion-agent.md](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\docs\agents\consultation-conversion-agent.md)
- `admin-ops-agent`
  - 관리자 문서, 규칙 시드, 게시 흐름, 운영 데이터 정합성을 담당한다.
  - 기준 문서: [docs/agents/admin-ops-agent.md](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\docs\agents\admin-ops-agent.md)
- `platform-reliability-agent`
  - Vercel, Supabase, EmailJS, Preview/Production 일관성, 스모크 테스트를 담당한다.
  - 기준 문서: [docs/agents/platform-reliability-agent.md](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\docs\agents\platform-reliability-agent.md)

## Handoff Rule

- 기능 변경을 시작할 때는 먼저 해당 에이전트 문서의 `Goal`, `Guardrails`, `Harness`를 따른다.
- 여러 영역이 걸리면 `eligibility-flow-agent -> consultation-conversion-agent -> platform-reliability-agent` 순으로 판단한다.
- 구현 후 공개 플로우 변경이 있으면 최소한 `eligibility smoke` 기준 확인을 남긴다.
