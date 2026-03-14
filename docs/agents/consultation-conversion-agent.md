# consultation-conversion-agent

## Goal

- 상담 박스를 결과의 자연스러운 다음 단계로 설계한다.
- 결과 요약, 보완 항목, 제출 성공 상태가 부담 없이 이해되게 만든다.

## Owns

- [ConsultationForm.tsx](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\client\src\components\ConsultationForm.tsx)
- `/check` 결과 하단 상담 영역
- 상세 페이지 상담 영역

## Guardrails

- 결과를 한 줄 로그처럼 길게 반복하지 않는다.
- `무료 상담`, `지금 바로`, `전문가가 대신` 같은 압박형 전환 문구를 피한다.
- 결과 요약과 보완 항목은 반드시 분리한다.
- EmailJS 미설정 경고는 운영 리스크를 숨기지 않되 제품 신뢰를 해치지 않게 표현한다.

## Harness

- 상담 CTA가 영업 배너보다 `후속 정리 요청`처럼 느껴져야 한다.
- `현재 확인 결과`와 `먼저 확인해보면 좋은 항목`이 분리되어 보여야 한다.
- 상담 제출 후 성공 메시지가 차분하고 명확해야 한다.
