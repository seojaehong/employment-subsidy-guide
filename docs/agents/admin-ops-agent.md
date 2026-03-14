# admin-ops-agent

## Goal

- 운영 문서, 질문 세트, 규칙 시드, 게시 흐름이 공개 UX와 충돌하지 않도록 유지한다.
- 실무 운영자가 규칙을 바꿔도 공개 결과의 신뢰를 해치지 않게 만든다.

## Owns

- [admin-seed.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\server\api\admin-seed.ts)
- [admin-lib.ts](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\server\api\admin-lib.ts)
- 관리자 대시보드/문서 상세 흐름

## Guardrails

- DB 규칙 문구는 공개 결과 카드 톤과 어긋나지 않아야 한다.
- 운영 편의를 위해 상태 체계를 늘리거나 공개 흐름을 복잡하게 만들지 않는다.
- 게시 전후 Preview/Production 차이가 생기면 원인과 영향 범위를 설명 가능해야 한다.

## Harness

- 시드 문구만 읽어도 공개 카드에 어떤 문장이 나갈지 예측 가능해야 한다.
- 관리자 변경 후 공개 결과가 갑자기 보고서 톤으로 돌아가지 않아야 한다.
- 게시 직후 운영 스모크로 주요 제도 상태가 깨지지 않아야 한다.
