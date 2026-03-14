# MVP Release Checklist

## 배포 전

- `Preview`와 `Production`에 아래 환경변수가 모두 들어 있는지 확인
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `VITE_EMAILJS_PUBLIC_KEY`
  - `VITE_EMAILJS_TEMPLATE_ID`
  - `VITE_EMAILJS_SERVICE_ID`
- `/check` 결과에서 `준비 패키지 열기` CTA가 `신청 가능` 또는 `조금 더 확인 필요` 상태에만 보이는지 확인
- `/prepare` 화면에서 준비 패키지 생성, 텍스트 복사, 인쇄/PDF 저장이 되는지 확인
- 관리자 콘솔에서 최근 상담 요청 목록이 보이는지 확인

## 배포 직후

- 홈, 목록, 상세, `/check`, `/prepare`, `/admin/login` 접속 확인
- `/api/programs`, `/api/eligibility/config`, `/api/health` 응답 확인
- 상담 요청 1건 테스트 후 이메일 수신과 `consultation_leads` 저장 여부 확인
- 관리자에서 문서 draft 생성 후 publish까지 1회 검증
- publish 뒤 공개 화면의 제도 문구와 상태가 최신 기준으로 반영됐는지 확인

## 주간 운영 점검

- 최근 상담 요청에서 보완 항목이 비정상적으로 반복되는지 확인
- `manual_review` 비율이 과도하게 높아지지 않는지 확인
- `/check` 첫 진입과 결과 전환 체감 속도 점검
- 최신 운영지침 반영이 필요한 제도가 있는지 관리자 문서 기준으로 검토
