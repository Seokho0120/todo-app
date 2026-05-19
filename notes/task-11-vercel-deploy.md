# Task 11: Vercel 배포

## 무엇을 했나

Next.js 앱을 Vercel에 배포했다. GitHub 연동 방식으로 배포하고, 환경변수 설정 및 여러 트러블슈팅을 거쳐 프로덕션 배포를 완료했다.

---

## Vercel이란?

**비유하자면 — 코드를 올리면 알아서 서버를 띄워주는 자동 배포 공장.**

GitHub에 push하면 Vercel이 자동으로:
1. 코드 pull
2. `pnpm install` 실행
3. `pnpm build` 실행
4. 서버 시작

Vue 프로젝트를 Netlify나 GitHub Pages에 올리는 것과 개념은 같다. Next.js에 특화되어 있어서 설정이 거의 없다.

---

## 배포 방식: GitHub 연동

CLI 대신 GitHub 연동 방식을 사용했다. 이유: 회사 네트워크 SSL 인증서 프록시로 인해 Vercel CLI 로그인이 막혔기 때문.

**흐름:**
1. vercel.com → GitHub 계정으로 로그인
2. Import Git Repository → todo-app 레포 선택
3. 환경변수 설정 → Deploy

GitHub에 push할 때마다 자동으로 재배포된다.

---

## 환경변수 설정

`.env.local`에 있는 값들을 Vercel 대시보드에도 동일하게 입력해야 한다.

| Key | 용도 |
|-----|------|
| `DATABASE_URL` | Supabase 연결 (pgbouncer, 6543 포트) |
| `DIRECT_URL` | Prisma 마이그레이션용 직접 연결 (5432 포트) |
| `NEXTAUTH_SECRET` | JWT 토큰 암호화 키 |

**`NEXTAUTH_URL`은 설정하지 않는다.** NextAuth v5에서 `trustHost: true`를 사용하면 Vercel의 `x-forwarded-host` 헤더로 URL을 자동 감지한다. 잘못된 값을 넣으면 리다이렉트가 엉뚱한 곳으로 가는 버그가 생긴다.

---

## 트러블슈팅 모음

### 1. PrismaClient 타입 에러

```
Type error: Module '"@prisma/client"' has no exported member 'PrismaClient'
```

**원인**: Vercel 빌드 시 `prisma generate`가 실행되지 않아 Prisma 클라이언트 타입이 없는 상태.

**해결**: `package.json` build 스크립트 수정:
```json
"build": "prisma generate && next build"
```

빌드 때 명시적으로 `prisma generate`를 먼저 실행해서 타입을 생성한 뒤 Next.js를 빌드한다.

---

### 2. 404: NOT_FOUND (Vercel 레벨)

**원인 1**: `NEXTAUTH_URL=https://todo-app.vercel.app`으로 잘못 설정 → 미들웨어가 리다이렉트를 `todo-app.vercel.app`(다른 사람 앱)으로 보냄.

**원인 2**: NextAuth v5가 Vercel 프록시 환경에서 호스트를 신뢰하지 않아 요청 자체를 거부.

**해결**:
- `lib/auth.ts`에 `trustHost: true` 추가
- Vercel 환경변수에서 `NEXTAUTH_URL` 삭제

```ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,  // ← 이 줄 추가
  providers: [...],
})
```

**비유하자면 — 경비원이 건물 내 CCTV(x-forwarded-host)를 신뢰하도록 허용하는 것.** 없으면 Vercel이 보내는 헤더를 믿지 않아서 요청을 막아버린다.

---

### 3. API 응답 속도 느림

**원인 1 — Cold Start**: Vercel 무료 플랜은 일정 시간 요청이 없으면 서버가 꺼진다. 첫 요청 때 다시 켜지는 데 1~3초 걸린다. 무료 플랜의 근본적인 한계.

**원인 2 — Prisma 연결 미재사용 (버그)**:

```ts
// 버그: 프로덕션에서는 연결을 캐시하지 않음
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

매 요청마다 새 DB 연결을 생성해서 느렸다.

**해결**: 항상 연결을 재사용하도록 수정:
```ts
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
globalForPrisma.prisma = prisma  // 프로덕션 포함 항상 캐시
```

**비유하자면 — 매번 새 전화기를 사서 전화하는 것 vs 기존 전화기를 재사용하는 것.** DB 연결은 비싼 작업이라 한번 만들면 재사용해야 한다.

---

### 4. 서버 리전

Vercel 기본 리전이 미국(iad1)이었다. 한국 사용자 기준으로 요청이 한국 → 미국 → DB → 미국 → 한국으로 왕복해서 느렸다.

**해결**: Vercel 대시보드 → Settings → Functions → Function Region을 **Seoul (icn1)** 으로 변경 후 재배포.

---

## pnpm onlyBuiltDependencies

```json
"pnpm": {
  "onlyBuiltDependencies": [
    "@prisma/client",
    "@prisma/engines",
    "prisma"
  ]
}
```

pnpm v10은 보안상 패키지의 postinstall 스크립트를 기본으로 막는다. Prisma 관련 패키지들이 빌드 스크립트를 실행할 수 있도록 명시적으로 허용한다.
