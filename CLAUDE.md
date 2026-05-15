# todo-app

Next.js 풀스택 할일 관리 앱. 로그인 + 할일 CRUD.

## 사용자 배경

- Vue 3 / Pinia 메인 프론트엔드 개발자. 백엔드 공부(Express, PostgreSQL, Prisma, JWT 등) 완료.
- React / Next.js는 익숙하지 않아 처음 접하는 수준.
- 직접 서비스를 만들기 위해 풀스택을 공부 중.

## 설명 원칙

1. **Vue 관점으로 연결** — 새로운 React/Next.js 개념은 Vue 대응 개념과 비교해서 설명. 예: "Providers는 Vue의 app.use()랑 같음", "useQuery는 Pinia의 action + state 합친 것", "'use client'는 Vue SFC랑 비슷하게 브라우저에서 실행되는 코드"
2. **왜(Why) 먼저** — 코드 주기 전에 왜 이렇게 하는지 이유 설명. "이렇게 하면 된다"보다 "이렇게 하는 이유는..."
3. **개념과 구조 상세 설명** — Next.js App Router, 서버 컴포넌트/클라이언트 컴포넌트 등 낯선 개념은 내부 동작 원리와 흐름을 충분히 설명한 후 실습으로 연결.
4. **수준 조절** — JS/TS 문법은 스킵. HTTP, REST API, Prisma, JWT 등 백엔드 개념은 한 번 공부했지만 아직 완전히 체화되지 않은 상태. 코드에 등장할 때마다 "왜 이렇게 쓰는지" 간단히 다시 짚어주기. React/Next.js 특유의 패턴은 처음이므로 충분히 설명.
5. **선생님 입장** — 처음 보는 사람도 이해할 수 있는 수준으로. 개념 설명은 길어도 됨.

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 인증 | NextAuth.js v5 (Credentials) |
| DB | PostgreSQL (Neon) |
| ORM | Prisma |
| 스타일 | Tailwind CSS + shadcn/ui |
| 서버 상태 | TanStack Query |
| 전역 상태 | Zustand |
| 패키지 매니저 | pnpm |
| 배포 | Vercel |

## 명령어

```bash
pnpm dev              # 개발 서버
pnpm build            # 빌드
pnpm lint             # 린트
pnpm prisma migrate dev   # DB 마이그레이션
pnpm prisma studio        # DB GUI
pnpm prisma generate      # 타입 재생성
```

## 프로젝트 구조

```
todo-app/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # 인증 API
│   │   └── todos/                # 할일 CRUD API
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   └── (app)/
│       └── todos/                # 메인 페이지
├── components/
├── lib/
│   ├── prisma.ts
│   └── auth.ts
├── store/                        # Zustand stores
├── hooks/                        # TanStack Query hooks
└── prisma/
    └── schema.prisma
```

## 코드 컨벤션

### API Route 패턴
- `app/api/todos/route.ts` — GET(목록), POST(생성)
- `app/api/todos/[id]/route.ts` — PATCH(수정), DELETE(삭제)
- 인증 확인: `getServerSession()` 으로 세션 검증 후 401 반환

### TanStack Query
- hook 네이밍: `useTodos`, `useCreateTodo`, `useUpdateTodo`, `useDeleteTodo`
- 위치: `hooks/` 디렉토리
- `queryKey` 컨벤션: `['todos']`, `['todos', id]`

### Zustand
- store 위치: `store/` 디렉토리
- UI 상태만 관리 (모달 open/close 등)
- 서버 데이터는 TanStack Query로 처리

### 컴포넌트
- 서버 컴포넌트 기본, 상호작용 필요시 `'use client'` 추가
- shadcn/ui 컴포넌트 우선 사용

## Git 규칙

- 커밋/푸쉬는 사용자가 명시적으로 요청할 때만 실행
- 커밋 전 반드시 커밋 메시지를 먼저 사용자에게 보여주고 확인 받기
