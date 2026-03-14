# platform-reliability-agent

## Goal

- Preview와 Production이 예측 가능하게 동작하도록 유지한다.
- Vercel, Supabase, EmailJS, 스모크 테스트를 통해 운영 이슈가 UX 이슈처럼 보이지 않게 만든다.

## Owns

- [eligibility-smoke-test-plan.md](C:\Users\iceam\OneDrive\5.산업안전\문서\Playground\repo_review\docs\eligibility-smoke-test-plan.md)
- Vercel 환경변수와 배포 확인 절차
- Supabase/EmailJS 연결 검증

## Guardrails

- Preview와 Production에서 보이는 화면 차이는 설명 가능해야 한다.
- 최신 커밋을 보고 있는 배포와 실제 테스트 URL을 항상 구분한다.
- 상담 성공 UI와 실제 이메일 수신이 어긋나지 않아야 한다.

## Harness

- 최신 Preview 커밋과 Production Current 커밋을 모두 확인한다.
- `VITE_EMAILJS_*` 3개가 필요한 환경에 모두 들어 있는지 점검한다.
- `npx.cmd playwright test e2e/eligibility-smoke.spec.ts --reporter=list` 결과를 배포 전후 기준으로 관리한다.
