# Google Social Login Method

## 개요

이 프로젝트의 구글 소셜 로그인은 **OAuth 2.0 PKCE 플로우**와 **iron-session**을 이용한 서버 사이드 세션 관리로 구현되어 있습니다.

---

## 인증 플로우 다이어그램

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐     ┌────────────┐
│   사용자     │     │    Next.js      │     │   Google    │     │  Database  │
│  (브라우저)  │     │     Server      │     │   OAuth     │     │            │
└──────┬──────┘     └────────┬────────┘     └──────┬──────┘     └─────┬──────┘
       │                     │                     │                   │
       │  1. 로그인 버튼 클릭  │                     │                   │
       │────────────────────>│                     │                   │
       │                     │                     │                   │
       │                     │ 2. PKCE 생성        │                   │
       │                     │  - state (CSRF)    │                   │
       │                     │  - verifier        │                   │
       │                     │  - challenge       │                   │
       │                     │                     │                   │
       │  3. 구글로 리다이렉트  │                     │                   │
       │<────────────────────│                     │                   │
       │                     │                     │                   │
       │  4. 구글 동의 화면    │                     │                   │
       │────────────────────────────────────────>│                   │
       │                     │                     │                   │
       │  5. auth code 반환   │                     │                   │
       │<────────────────────────────────────────│                   │
       │                     │                     │                   │
       │  6. callback 호출    │                     │                   │
       │────────────────────>│                     │                   │
       │                     │                     │                   │
       │                     │ 7. code → token 교환 │                   │
       │                     │────────────────────>│                   │
       │                     │                     │                   │
       │                     │ 8. access_token +   │                   │
       │                     │    id_token 반환    │                   │
       │                     │<────────────────────│                   │
       │                     │                     │                   │
       │                     │ 9. JWT 검증 (JWKS)  │                   │
       │                     │                     │                   │
       │                     │ 10. 기존 회원 조회    │                   │
       │                     │─────────────────────────────────────────>│
       │                     │                     │                   │
       │                     │ 11. iron-session 저장│                   │
       │                     │                     │                   │
       │  12. 리다이렉트       │                     │                   │
       │  (약관/홈 페이지)      │                     │                   │
       │<────────────────────│                     │                   │
```

---

## 주요 파일 구조

| 파일 경로 | 역할 |
|-----------|------|
| `/api/auth/google/start/route.ts` | OAuth 플로우 시작, PKCE 생성 |
| `/api/auth/google/callback/route.ts` | 콜백 처리, 토큰 검증 |
| `/api/auth/session/route.ts` | 세션 조회 |
| `/api/auth/consent/accept/route.ts` | 약관 동의 처리 |
| `/api/auth/logout/route.ts` | 로그아웃 |
| `/api/auth/getUser/route.ts` | 사용자 정보 조회 |
| `/lib/session.ts` | iron-session 설정 |
| `/app/models/auth-only.dto.ts` | 세션 DTO 정의 |

---

## 1. 로그인 시작 (`/api/auth/google/start`)

### 요청
```
GET /api/auth/google/start?state={redirectUrl}
```

### 처리 로직
```typescript
// 1. PKCE 값 생성
const state = randomString(16);          // CSRF 방지 토큰
const verifier = randomString(32);       // PKCE verifier (32바이트)
const challenge = toCodeChallenge(verifier);  // SHA256 해시

// 2. 쿠키에 임시 저장 (5분 유효)
cookieStore.set("oidc_state", state, { httpOnly: true, maxAge: 300 });
cookieStore.set("pkce_verifier", verifier, { httpOnly: true, maxAge: 300 });
cookieStore.set("auth_redirect", redirectUrl, { httpOnly: true, maxAge: 300 });

// 3. 구글 OAuth로 리다이렉트
const params = new URLSearchParams({
  client_id: process.env.GOOGLE_CLIENT_ID,
  redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  response_type: "code",
  scope: "openid email profile",
  code_challenge: challenge,
  code_challenge_method: "S256",
  state,
});

return NextResponse.redirect(
  `https://accounts.google.com/o/oauth2/v2/auth?${params}`
);
```

### PKCE (Proof Key for Code Exchange)
- **목적**: Authorization Code 탈취 공격 방지
- **verifier**: 클라이언트에서 생성한 랜덤 문자열
- **challenge**: verifier의 SHA256 해시값 (Base64 URL 인코딩)
- **검증**: 구글이 토큰 교환 시 verifier와 challenge 일치 확인

---

## 2. 콜백 처리 (`/api/auth/google/callback`)

### 요청
```
GET /api/auth/google/callback?code={authCode}&state={state}
```

### 처리 단계

#### Step 1: 보안 검증
```typescript
// CSRF 방지: state 토큰 검증
if (state !== savedState) {
  return NextResponse.redirect("/auth/error");
}

// PKCE verifier 확인
if (!verifier) {
  return NextResponse.redirect("/auth/error");
}
```

#### Step 2: 토큰 교환
```typescript
const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    code: authCode,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    code_verifier: verifier,  // PKCE 검증
  }),
});

// 응답 예시
{
  "access_token": "ya29.xxx...",
  "id_token": "eyJhbGciOiJS...",  // JWT
  "token_type": "Bearer",
  "expires_in": 3599
}
```

#### Step 3: JWT 검증 (jose 라이브러리)
```typescript
import * as jose from "jose";

// 구글 공개 키셋 다운로드
const JWKS = jose.createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

// JWT 서명 검증
const { payload } = await jose.jwtVerify(
  tokenResponse.id_token,
  JWKS,
  {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: process.env.GOOGLE_CLIENT_ID,
  }
);

// payload 내용
{
  "iss": "https://accounts.google.com",
  "sub": "1234567890",              // 구글 고유 ID (provider_user_id)
  "email": "user@gmail.com",
  "email_verified": true,
  "name": "홍길동",
  "picture": "https://lh3.googleusercontent.com/...",
  "iat": 1700000000,
  "exp": 1700003600
}
```

#### Step 4: 회원 확인
```typescript
// 1차: provider_user_id로 기존 소셜 계정 검색
const existingSocial = await query(
  `SELECT member_id_uuid FROM member_social_accounts
   WHERE provider = 'google' AND provider_user_id = $1`,
  [providerUserId]
);

// 2차: 이메일로 기존 회원 검색 (소셜 계정 없는 경우)
if (!existingSocial && email) {
  const existingMember = await query(
    `SELECT id_uuid FROM members WHERE email = $1`,
    [email]
  );
}
```

#### Step 5: 세션 저장
```typescript
session.auth = {
  provider: "google",
  provider_user_id: providerUserId,  // 구글 sub
  email,                              // null 가능
  avatar: payload.picture,
  name: payload.name,
  status: memberId ? "active" : "pending",
  id_uuid: memberId,                  // 기존 회원만 설정
};
await session.save();
```

---

## 3. 세션 관리 (iron-session)

### 설정 (`/lib/session.ts`)
```typescript
import { SessionOptions } from "iron-session";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_PASSWORD!,  // 32바이트 암호화 키
  cookieName: "app_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};
```

### 세션 DTO (`/app/models/auth-only.dto.ts`)
```typescript
export interface AuthOnlyDto {
  id_uuid?: string | null;         // DB 사용자 ID
  email?: string | null;           // 이메일 (null 가능)
  provider: "google" | "apple" | "facebook";
  provider_user_id: string;        // 구글 고유 ID
  avatar?: string | null;          // 프로필 이미지
  name?: string | null;            // 사용자 이름
  status: "pending" | "active";    // 약관 동의 상태
}
```

### 상태 (status)
- **pending**: 약관 미동의 (신규 회원)
- **active**: 약관 동의 완료 (정상 회원)

---

## 4. 약관 동의 처리 (`/api/auth/consent/accept`)

### 요청
```typescript
POST /api/auth/consent/accept
{
  "marketingOptIn": true  // 마케팅 동의 (선택)
}
```

### 처리 로직
```typescript
// 1. pending 상태만 허용
if (session.auth?.status !== "pending") {
  return new NextResponse("Forbidden", { status: 403 });
}

// 2. 약관 동의 정보
const termsAgreement = {
  "age_14_or_older": { agreed: true, required: true },
  "terms_of_service": { agreed: true, required: true },
  "location_terms": { agreed: true, required: true },
  "personal_info": { agreed: true, required: true },
  "marketing_ads": { agreed: marketingOptIn, required: false }
};

// 3. 회원 생성 또는 업데이트
await query("BEGIN");

if (!memberId) {
  // 신규 회원: 닉네임 자동 생성
  const nickname = generateNickname();
  const result = await query(
    `INSERT INTO members (email, avatar, nickname, name, terms_agreements, ...)
     VALUES ($1, $2, $3, $4, $5::jsonb, ...)
     RETURNING id_uuid`,
    [email, avatar, nickname, name, JSON.stringify(termsAgreement)]
  );
  memberId = result[0].id_uuid;
}

// 4. 소셜 계정 연결
await query(
  `INSERT INTO member_social_accounts
   (member_id_uuid, provider, provider_user_id, provider_email, ...)
   VALUES ($1, $2, $3, $4, ...)
   ON CONFLICT (provider, provider_user_id)
   DO UPDATE SET member_id_uuid = EXCLUDED.member_id_uuid`,
  [memberId, provider, providerUserId, email]
);

await query("COMMIT");

// 5. 세션 active로 승격
session.auth.status = "active";
session.auth.id_uuid = memberId;
await session.save();
```

---

## 5. 환경 변수

```bash
# Google OAuth
GOOGLE_CLIENT_ID=579022203717-xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Session 암호화 키 (32바이트 base64)
SESSION_PASSWORD='lFV6q8r7/3s7WWGXUqWK5HJugqMdC+rdWDzLSHisBtE='
```

---

## 6. 데이터베이스 테이블

### members
```sql
CREATE TABLE members (
  id_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),              -- null 가능 (구글 공유 거부 시)
  avatar VARCHAR(500),
  nickname VARCHAR(100) NOT NULL,  -- 자동 생성
  name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  terms_agreements JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### member_social_accounts
```sql
CREATE TABLE member_social_accounts (
  id SERIAL PRIMARY KEY,
  member_id_uuid UUID REFERENCES members(id_uuid),
  provider VARCHAR(20) NOT NULL,         -- 'google', 'apple', 'facebook'
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(provider, provider_user_id)     -- 중복 방지
);
```

---

## 7. 보안 특징

| 보안 항목 | 구현 방식 | 효과 |
|-----------|-----------|------|
| CSRF 방지 | state 토큰 검증 | 인증 코드 탈취 방지 |
| PKCE | code_challenge + code_verifier | 공개 클라이언트 보안 강화 |
| JWT 검증 | 구글 JWKS로 서명 검증 | 위조된 토큰 거부 |
| HttpOnly 쿠키 | iron-session 자동 설정 | XSS 공격 방지 |
| SameSite | sameSite: "lax" | CSRF 공격 방지 |
| HTTPS | secure: production | 통신 암호화 |
| DB 검증 | 세션 조회 시 DB 확인 | 삭제된 사용자 세션 무효화 |

---

## 8. 클라이언트 사용 예시

### 로그인 버튼
```typescript
const handleGoogleLogin = () => {
  const redirectUrl = encodeURIComponent(window.location.pathname);
  window.location.href = `/api/auth/google/start?state=${redirectUrl}`;
};
```

### 세션 확인
```typescript
const checkSession = async () => {
  const res = await fetch('/api/auth/session');
  const { auth } = await res.json();

  if (auth?.status === 'active') {
    // 로그인 완료
  } else if (auth?.status === 'pending') {
    // 약관 동의 필요
  } else {
    // 미로그인
  }
};
```

### 사용자 정보 조회
```typescript
const getUserInfo = async () => {
  const res = await fetch('/api/auth/getUser');
  const { userInfo } = await res.json();
  return userInfo;
};
```

### 로그아웃
```typescript
const logout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/';
};
```

---

## 9. 주요 의존성

```json
{
  "iron-session": "^8.0.4",   // 서버 사이드 세션 관리
  "jose": "^6.1.0"            // JWT 검증 (JWKS)
}
```

---

## 요약

1. **OAuth 2.0 PKCE 플로우**로 안전하게 인증 코드 교환
2. **jose 라이브러리**로 구글 JWKS 기반 JWT 검증
3. **iron-session**으로 암호화된 서버 사이드 세션 관리
4. **2단계 상태 관리**: pending (약관 미동의) → active (약관 동의)
5. **이메일 null 허용**: 구글에서 이메일 공유 거부해도 가입 가능
6. **소셜 계정 분리 저장**: 하나의 회원에 여러 소셜 계정 연결 가능
