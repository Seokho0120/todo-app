# Task 2: 디렉토리 구조 세팅

## 무엇을 했나

Next.js scaffold 직후엔 `app/`, `public/` 정도만 있다. 나중에 파일을 추가할 때마다 폴더를 만들면 구조가 흐트러지므로, 처음에 전체 구조를 한 번에 잡아뒀다.

---

## Next.js App Router 파일 기반 라우팅

**비유하자면 — 서랍장 구조.**
서랍 이름이 곧 URL이다. `login` 서랍 안에 `page.tsx`를 넣으면 `/login` 페이지가 생긴다. 별도로 "이 서랍은 /login이야"라고 선언할 필요가 없다.

### Vue Router vs Next.js App Router

Vue에서는 라우터를 직접 선언했다:
```js
// router/index.ts
{ path: '/login', component: LoginPage }
{ path: '/todos', component: TodosPage }
```

Next.js App Router는 **폴더 구조 자체가 라우터**다. 별도 선언 없이 폴더 + `page.tsx` 파일만 만들면 URL이 생긴다:

```
app/page.tsx                  →  /
app/login/page.tsx            →  /login
app/todos/page.tsx            →  /todos
app/api/todos/route.ts        →  GET|POST /api/todos
app/api/todos/[id]/route.ts   →  GET|PATCH|DELETE /api/todos/:id
```

규칙:
- `page.tsx` 있는 폴더 = 브라우저에서 접근 가능한 URL
- `route.ts` 있는 폴더 = API 엔드포인트 (Express의 router 파일)
- `[id]` 대괄호 = 동적 경로 파라미터 (Express의 `:id`와 같음)

---

## Route Groups: `(auth)`, `(app)`

**비유하자면 — 회사의 부서 구분.**
"개발팀", "디자인팀"으로 나눠놔도 직원 이름(URL)에는 부서명이 안 붙는다. 단지 같은 팀끼리 같은 규칙(레이아웃)을 적용하기 위해 묶어두는 것.

괄호로 감싼 폴더는 **URL에 나타나지 않는 논리적 그룹**이다:

```
app/(auth)/login/page.tsx    →  /login   (URL에 "auth" 없음)
app/(app)/todos/page.tsx     →  /todos   (URL에 "app" 없음)
```

왜 그룹을 나누냐면, 그룹별로 **레이아웃을 다르게** 적용할 수 있기 때문이다:

```
app/(auth)/
├── layout.tsx    ← 헤더 없는 심플한 레이아웃 (로그인/회원가입 화면)
├── login/
│   └── page.tsx
└── register/
    └── page.tsx

app/(app)/
├── layout.tsx    ← 헤더 있는 메인 레이아웃 (로그인 후 화면)
└── todos/
    └── page.tsx
```

나중에 미들웨어로 `(app)` 그룹 전체를 로그인 보호할 수도 있다.

---

## 전체 폴더 구조

```
todo-app/
├── app/
│   ├── (auth)/
│   │   ├── login/          /login 페이지
│   │   └── register/       /register 페이지
│   ├── (app)/
│   │   └── todos/          /todos 페이지 (메인)
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/  NextAuth 내부 처리 (자동)
│       │   └── register/       POST /api/auth/register (회원가입)
│       └── todos/
│           ├── route.ts        GET /api/todos, POST /api/todos
│           └── [id]/
│               └── route.ts    PATCH /api/todos/:id, DELETE /api/todos/:id
│
├── components/
│   ├── auth/       로그인/회원가입 폼 컴포넌트
│   ├── todos/      TodoCard, CommentSection 등
│   └── ui/         shadcn/ui 기본 컴포넌트 (버튼, 인풋 등)
│
├── hooks/          TanStack Query hooks (useTodos, useCreateTodo 등)
├── store/          Zustand 전역 상태 (모달 open/close 등 UI 상태)
├── lib/            Prisma 클라이언트, NextAuth 설정 등 공유 유틸
├── types/          TypeScript 타입 선언 (next-auth.d.ts 등)
└── prisma/         Prisma 스키마, 마이그레이션 파일
```

---

## `app/api/` — Next.js의 백엔드

**비유하자면 — 같은 건물 안에 가게(프론트)와 창고(백엔드)가 같이 있는 것.**
Express는 프론트 서버 따로, 백엔드 서버 따로 띄워야 했는데, Next.js는 하나의 프로젝트에서 둘 다 처리한다.

Express 방식:
```js
// routes/todos.js
router.get('/', getAllTodos)
router.post('/', createTodo)
router.patch('/:id', updateTodo)
router.delete('/:id', deleteTodo)
```

Next.js 방식:
```ts
// app/api/todos/route.ts
export async function GET() { ... }    // GET /api/todos
export async function POST() { ... }   // POST /api/todos

// app/api/todos/[id]/route.ts
export async function PATCH() { ... }  // PATCH /api/todos/:id
export async function DELETE() { ... } // DELETE /api/todos/:id
```

HTTP 메서드 이름 그대로 함수 이름을 쓰면 된다.

---

## `[...nextauth]` 폴더

**비유하자면 — 안내 데스크.**
`/api/auth/signin`, `/api/auth/signout`, `/api/auth/session` 등 NextAuth가 필요한 모든 경로를 이 하나의 폴더가 알아서 처리한다. 직접 코드를 작성하지 않아도 된다.

`...`는 "catch-all" 라우트. 뒤에 어떤 경로가 오든 다 받아서 NextAuth 내부 로직으로 넘긴다.
