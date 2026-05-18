# Task 5: NextAuth v5 설정

## 무엇을 했나

로그인/세션 관리를 담당하는 NextAuth를 설정했다. 미들웨어(proxy.ts)로 비로그인 사용자가 보호된 페이지에 접근하지 못하도록 막는 기능도 추가했다.

---

## NextAuth란?

**비유하자면 — 건물 입구의 경비원.**

로그인한 사람만 건물(앱) 안으로 들여보내고, 로그인 안 한 사람은 입구(로그인 페이지)로 돌려보낸다. 세션(누가 로그인했는지 기억)도 관리한다.

백엔드 공부 때 JWT를 직접 만들었던 것 — 토큰 생성, 검증, 만료 처리 — 을 NextAuth가 대신 해준다.

---

## 파일 구조

```
lib/auth.ts                          NextAuth 핵심 설정
types/next-auth.d.ts                 TypeScript 타입 확장
app/api/auth/[...nextauth]/route.ts  NextAuth API 엔드포인트
proxy.ts                             페이지 접근 제어 (미들웨어)
```

---

## lib/auth.ts

NextAuth 설정의 핵심 파일.

```ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [...],  // 로그인 방식 (Google, GitHub, Credentials 등)
  callbacks: {...},  // 토큰/세션 커스터마이징
  pages: { signIn: '/login' },  // 커스텀 로그인 페이지 경로
})
```

### Credentials Provider

**비유하자면 — 이메일/비밀번호로 직접 검증하는 방식.**

Google 로그인, GitHub 로그인 같은 소셜 로그인 말고, 우리가 직접 이메일+비밀번호를 DB에서 검증하는 방식이다.

```ts
Credentials({
  async authorize(credentials) {
    // 1. DB에서 유저 찾기
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    })
    if (!user) return null  // 없으면 로그인 실패

    // 2. 비밀번호 검증 (bcrypt)
    const isValid = await bcrypt.compare(credentials.password, user.password)
    if (!isValid) return null  // 틀리면 로그인 실패

    // 3. 성공하면 유저 정보 반환 → 세션에 저장됨
    return { id: String(user.id), email: user.email }
  }
})
```

### JWT Callback

**비유하자면 — 출입증(토큰)에 사번(user.id) 도장 찍기.**

기본 JWT에는 email만 들어있다. 우리는 `user.id`도 필요해서 토큰에 추가한다.

```ts
jwt({ token, user }) {
  if (user) token.id = user.id  // 로그인 시 토큰에 id 저장
  return token
}
```

### Session Callback

**비유하자면 — 토큰에서 정보를 꺼내 세션에 담기.**

JWT 토큰의 id를 session.user.id로 옮겨서 클라이언트에서 `session.user.id`로 접근 가능하게 한다.

```ts
session({ session, token }) {
  if (token.id) session.user.id = token.id as string
  return session
}
```

---

## types/next-auth.d.ts

**비유하자면 — NextAuth의 기본 타입에 우리가 쓸 필드 추가 신청서.**

NextAuth 기본 Session 타입에는 `user.id`가 없다. TypeScript에게 "우리 Session에는 id가 있어"라고 알려주는 파일.

```ts
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']  // 기존 타입(name, email, image)도 유지
  }
}
```

이게 없으면 `session.user.id` 접근 시 TypeScript 에러 발생.

---

## app/api/auth/[...nextauth]/route.ts

```ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

**비유하자면 — NextAuth의 내부 API를 우리 앱에 연결하는 플러그.**

NextAuth가 필요한 `/api/auth/signin`, `/api/auth/signout`, `/api/auth/session` 등의 경로를 이 파일 하나가 모두 처리한다. 코드 한 줄로 끝.

---

## proxy.ts

**비유하자면 — 모든 페이지 입장 전 검사하는 게이트.**

모든 요청이 페이지에 도달하기 전에 이 파일을 거친다. Next.js 16에서 `middleware.ts` → `proxy.ts`로 파일명이 바뀌었다. 반드시 `proxy.ts`여야 Next.js가 인식한다.

```ts
export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  // 로그인 안 했는데 일반 페이지 접근 → /login으로 강제 이동
  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL('/login', req.url))
  }

  // 로그인 했는데 로그인 페이지 접근 → /todos로 강제 이동
  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL('/todos', req.url))
  }
})

export const config = {
  // API, 정적 파일, 이미지는 검사 제외
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

Vue Router의 Navigation Guard (`router.beforeEach`)와 같은 역할이다.

### Next.js 16 변경사항

Next.js 16에서 `middleware.ts` → `proxy.ts`로 파일명이 바뀌었다. 기능은 동일하고 이름만 변경됨.

> ⚠️ 프로젝트 루트에 `proxy.ts`라는 파일이 남아있는데, 이건 아무 역할도 안 한다. Next.js는 `middleware.ts`만 미들웨어로 인식한다.

---

## NEXTAUTH_SECRET

**비유하자면 — JWT 토큰을 암호화하는 자물쇠 열쇠.**

이 값으로 세션 토큰을 암호화한다. 외부에 노출되면 토큰을 위조할 수 있어서 `.env.local`에만 보관하고 절대 GitHub에 올리면 안 된다.

```bash
openssl rand -base64 32  # 랜덤 32바이트 → base64 인코딩
```
