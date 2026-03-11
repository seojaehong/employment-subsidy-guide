# EmailJS 설정 가이드

상담 신청 폼에서 `abc@winhr.co.kr`로 이메일이 발송되려면 아래 3단계를 완료해야 합니다.

---

## 1단계 — EmailJS 계정 생성 및 이메일 서비스 연결

1. [https://www.emailjs.com/](https://www.emailjs.com/) 접속 → **Sign Up Free** 클릭
2. 회원가입 완료 후 대시보드 진입
3. 좌측 메뉴 **Email Services** → **Add New Service**
4. **Gmail** 또는 **Outlook** 선택 (winhr.co.kr 도메인이면 Outlook 또는 Custom SMTP 선택)
5. 연결할 이메일 계정으로 인증 완료
6. 생성된 **Service ID** 복사 (예: `service_abc123`)

---

## 2단계 — 이메일 템플릿 생성

1. 좌측 메뉴 **Email Templates** → **Create New Template**
2. 아래 내용으로 템플릿 작성:

**Subject (제목):**
```
[고용장려금 상담 신청] {{from_name}} ({{from_company}}) - {{consult_type}}
```

**Body (본문) — HTML 에디터에서 작성:**
```html
<h2>새로운 상담 신청이 접수되었습니다</h2>

<table style="border-collapse:collapse; width:100%;">
  <tr>
    <td style="padding:8px; border:1px solid #ddd; background:#f5f5f5; font-weight:bold; width:140px;">신청 일시</td>
    <td style="padding:8px; border:1px solid #ddd;">{{submitted_at}}</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid #ddd; background:#f5f5f5; font-weight:bold;">담당자명</td>
    <td style="padding:8px; border:1px solid #ddd;">{{from_name}}</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid #ddd; background:#f5f5f5; font-weight:bold;">연락처</td>
    <td style="padding:8px; border:1px solid #ddd;">{{from_phone}}</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid #ddd; background:#f5f5f5; font-weight:bold;">회사명</td>
    <td style="padding:8px; border:1px solid #ddd;">{{from_company}}</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid #ddd; background:#f5f5f5; font-weight:bold;">상담 유형</td>
    <td style="padding:8px; border:1px solid #ddd;">{{consult_type}}</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid #ddd; background:#f5f5f5; font-weight:bold;">관련 지원금</td>
    <td style="padding:8px; border:1px solid #ddd;">{{subsidy_name}}</td>
  </tr>
  <tr>
    <td style="padding:8px; border:1px solid #ddd; background:#f5f5f5; font-weight:bold;">문의 내용</td>
    <td style="padding:8px; border:1px solid #ddd;">{{message}}</td>
  </tr>
</table>

<p style="margin-top:16px; color:#666; font-size:13px;">
  본 이메일은 고용장려금 가이드 사이트 (노무법인 위너스)에서 자동 발송되었습니다.
</p>
```

3. **To Email** 항목에 `abc@winhr.co.kr` 입력
4. **Save** 클릭 후 생성된 **Template ID** 복사 (예: `template_xyz789`)

---

## 3단계 — Public Key 확인 및 환경변수 등록

1. 좌측 메뉴 **Account** → **API Keys** → **Public Key** 복사 (예: `user_AbCdEfGhIjKlMnOp`)

2. Manus 사이트 관리 패널에서 **Settings → Secrets** 탭으로 이동

3. 아래 3개 환경변수 추가:

| 변수명 | 값 |
|--------|-----|
| `VITE_EMAILJS_SERVICE_ID` | 1단계에서 복사한 Service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | 2단계에서 복사한 Template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | 3단계에서 복사한 Public Key |

4. 저장 후 사이트 재배포 → 상담 신청 시 `abc@winhr.co.kr`로 이메일 자동 발송 완료

---

## 무료 플랜 한도

| 항목 | 무료 플랜 |
|------|-----------|
| 월 발송 건수 | **200건** |
| 이메일 서비스 수 | 2개 |
| 템플릿 수 | 2개 |

월 200건 초과 시 유료 플랜($15/월, 1,000건)으로 업그레이드하면 됩니다.
