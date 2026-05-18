# Task 08 — 할일/댓글 API Routes

## 비유

**비유하자면**, API Route 파일은 Express의 라우터 파일이야.

```
Express                              Next.js App Router
─────────────────────────────────    ─────────────────────────────────
router.get('/todos', handler)     →  app/api/todos/route.ts (GET)
router.post('/todos', handler)    →  app/api/todos/route.ts (POST)
router.patch('/todos/:id', ...)   →  app/api/todos/[id]/route.ts (PATCH)
router.delete('/todos/:id', ...) →  app/api/todos/[id]/route.ts (DELETE)
```

파일 경로가 곧 URL 경로다. `[id]`는 Express의 `:id`와 같음.

---

## 왜 이렇게 구조를 나눴나

### route.ts vs [id]/route.ts

```
app/api/todos/route.ts          →  /api/todos        (컬렉션 전체)
app/api/todos/[id]/route.ts     →  /api/todos/123    (개별 항목)
```

REST API 관례:
- 컬렉션 (`/todos`): GET(목록 조회), POST(새 항목 생성)
- 개별 항목 (`/todos/123`): PATCH(수정), DELETE(삭제)

---

## Next.js 16에서 params가 Promise가 된 이유

### 변경 전 (Next.js 14)
```ts
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }  // 그냥 객체
) {
  const id = params.id  // 바로 접근
}
```

### 변경 후 (Next.js 15+/16)
```ts
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // Promise로 변경
) {
  const { id } = await params  // await 필요
}
```

**왜 바뀌었나?** — Next.js가 Edge Runtime에서 params를 비동기적으로 처리하도록 최적화하면서 Promise로 변경됨. `await params`를 빠뜨리면 TypeScript가 에러를 내준다.

---

## 인증 확인 패턴

모든 보호된 API에서 동일하게 쓰는 패턴:

```ts
export async function POST(req: Request) {
  const session = await auth()          // 현재 세션 가져오기
  if (!session?.user?.id) {             // 세션 없으면
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  // 이후 로직...
}
```

**Vue 비교**: Express + JWT 미들웨어에서 이렇게 했던 것:
```js
// Express 미들웨어
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  req.user = decoded
  next()
}
```

Next.js에서는 미들웨어 대신 각 route handler에서 `auth()`로 직접 세션을 확인한다.

---

## 소유권 확인 패턴 (내 글만 수정/삭제)

```ts
const todo = await prisma.todo.findUnique({ where: { id: Number(id) } })

// 두 가지 체크를 한 번에:
// 1. todo가 존재하는지
// 2. 내 todo인지 (userId 일치 여부)
if (!todo || todo.userId !== Number(session.user.id)) {
  return NextResponse.json({ error: '찾을 수 없습니다.' }, { status: 404 })
}
```

403 대신 404를 반환하는 이유 — 보안상 "접근 거부"보다 "존재 자체를 모름"처럼 보이게 해서 다른 사람의 todo id를 탐색하기 어렵게 만드는 관례.

---

## Prisma relation 이름 주의

스키마에서 relation 이름이 `author`냐 `user`냐가 다르다:

```prisma
model Todo {
  user    User  @relation(...)  // ← 'user'
}

model Comment {
  author  User  @relation(...)  // ← 'author'
}
```

```ts
// Todo 조회 시
prisma.todo.findMany({
  include: { user: { select: { id: true, email: true } } }  // 'user'
})

// Comment 조회 시
prisma.comment.findMany({
  include: { author: { select: { id: true, email: true } } }  // 'author'
})
```

스키마에 정의된 이름 그대로 써야 한다. 이름이 다르면 Prisma가 타입 에러를 냄.

---

## 파일 구조 전체

```
app/api/todos/
  route.ts                          GET(전체 피드), POST(할일 생성)
  [id]/
    route.ts                        PATCH(수정), DELETE(삭제) — 내 글만
    comments/
      route.ts                      GET(댓글 목록), POST(댓글 작성)
      [commentId]/
        route.ts                    PATCH(수정), DELETE(삭제) — 내 댓글만
```

---

## providers.tsx + layout.tsx 수정 (로그인 동작을 위한 필수 설정)

### 왜 Providers가 필요한가

`signIn()`, `useSession()` 같은 NextAuth 클라이언트 함수들은 내부적으로 React Context를 사용한다. 이 Context를 공급해주는 게 `SessionProvider`.

**비유하자면**, 전기 콘센트(SessionProvider)를 꽂아야 전자기기(signIn, useSession)를 쓸 수 있는 것과 같음.

```tsx
// app/providers.tsx
'use client'
export function Providers({ children }) {
  return (
    <SessionProvider>           {/* NextAuth 세션 공급 */}
      <QueryClientProvider>    {/* TanStack Query 캐시 공급 */}
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

### layout.tsx에 주입

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>  {/* 전체 앱을 감쌈 */}
      </body>
    </html>
  )
}
```

**Vue 비교**: Vue에서 `main.ts`에서 `app.use(pinia).use(router)`로 플러그인 등록하던 것처럼, Next.js에서는 `layout.tsx`에서 Provider로 감싸는 방식으로 전역 상태/기능을 주입한다.
