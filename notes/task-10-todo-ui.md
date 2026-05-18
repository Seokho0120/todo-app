# Task 10: 할일 UI 컴포넌트

## 무엇을 했나

할일 목록 페이지의 UI를 구성하는 컴포넌트들을 만들었다. 작성 폼, 카드, 댓글 섹션, 댓글 아이템, 그리고 이것들을 조합하는 페이지까지.

---

## 컴포넌트 구조

**비유하자면 — 레고 블록 조립.**

작은 블록(CommentItem)을 모아 중간 블록(CommentSection)을 만들고, 중간 블록들을 모아 큰 블록(TodoCard)을 만들고, 큰 블록들을 페이지(TodoList → TodoPage)에 꽂는다.

```
TodoPage
├── TodoForm          → 새 할일 입력 + 추가 버튼
└── TodoList
    └── TodoCard (반복)
        ├── Checkbox + 내용 + 수정/삭제 버튼
        └── CommentSection
            └── CommentItem (반복)
```

Vue로 치면: 부모 컴포넌트가 자식 컴포넌트를 `<template>`에 등록해서 쓰는 것과 완전히 동일하다.

---

## 서버 컴포넌트 vs 클라이언트 컴포넌트

**왜 이게 중요하냐** — React/Next.js의 핵심 개념이다. Vue에는 없는 개념.

| 구분 | 서버 컴포넌트 | 클라이언트 컴포넌트 |
|------|-------------|-----------------|
| 실행 위치 | 서버에서만 | 브라우저에서 |
| 선언 방식 | 기본값 (아무것도 안 씀) | 파일 맨 위에 `'use client'` |
| 가능한 것 | DB 직접 접근, async/await | useState, useEffect, 이벤트 핸들러 |
| 불가능한 것 | useState, 이벤트 핸들러 | DB 직접 접근 |

이번 Task 10의 모든 컴포넌트는 `'use client'`를 붙였다. 왜냐면 useState(입력값 상태), useQuery(TanStack Query), useMutation 등을 써야 하기 때문.

`app/(app)/todos/page.tsx`는 서버 컴포넌트다 — 브라우저 기능 없이 서버에서 세션만 확인하면 되기 때문.

---

## app/(app)/todos/page.tsx — 서버 컴포넌트

```tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TodoPage } from '@/components/todos/todo-page'

export default async function TodosPage() {
  const session = await auth()
  if (!session) redirect('/login')
  return <TodoPage />
}
```

**비유하자면 — 건물 입구 경비원.**

페이지를 열기 전에 서버에서 먼저 로그인 여부를 체크한다. 비로그인이면 `/login`으로 즉시 쫓아낸다. 이게 통과되면 실제 UI(`TodoPage`)를 렌더링한다.

Vue Router의 `router.beforeEach()`와 동일한 역할. middleware(proxy.ts)가 1차 방어선이고, 이 서버 컴포넌트가 2차 방어선.

---

## TodoPage — 레이아웃 + 로그아웃

```tsx
async function handleSignOut() {
  await signOut({ redirect: false })
  window.location.href = '/login'
}
```

**왜 `window.location.href`를 쓰냐?**

NextAuth v5 beta에서 `signOut({ callbackUrl: '/login' })`이 제대로 동작하지 않는 버그가 있다. `redirect: false`로 세션만 제거한 뒤, 브라우저가 직접 `/login`으로 이동하도록 `window.location.href`를 쓰는 게 확실한 방법.

---

## TodoForm — 새 할일 입력

```tsx
const { mutate: createTodo, isPending } = useCreateTodo()

function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  if (!content.trim()) return
  createTodo(content, { onSuccess: () => setContent('') })
}
```

Vue의 `@submit.prevent="handleSubmit"`과 동일하다. `e.preventDefault()`가 `@submit.prevent`의 역할.

`isPending`은 `createTodo` 요청이 서버에서 처리 중일 때 `true`가 된다. 이 동안 버튼을 `disabled`로 막아 중복 제출을 방지한다.

---

## TodoCard — 할일 카드

핵심 로직:

```tsx
const { data: session } = useSession()
const isOwner = session?.user?.id === String(todo.userId)
```

**비유하자면 — 게시판의 "내 글" 판별.**

서버에서 받은 `todo.userId`(숫자)와 세션의 `session.user.id`(문자열)를 비교한다. 타입이 달라서 `String()`으로 맞춰준다.

`isOwner`가 `true`일 때만 수정/삭제 버튼이 보인다. 남의 글은 체크박스(완료 처리)도 비활성화.

---

## CommentSection — 댓글 열기/닫기

```tsx
const { openCommentTodoId, setOpenCommentTodoId } = useUIStore()
const isOpen = openCommentTodoId === todoId
```

**비유하자면 — 아코디언 메뉴.**

한 번에 하나의 할일 카드의 댓글만 열 수 있다. Zustand의 `openCommentTodoId`에 현재 열린 카드의 ID를 저장하고, 같은 카드를 또 클릭하면 닫힌다.

Vue의 Pinia store에서 `openedCardId`를 관리하는 것과 완전히 동일한 패턴.

---

## 상태 관리 분리 원칙

| 상태 종류 | 도구 | 예시 |
|----------|------|------|
| 서버 데이터 | TanStack Query | 할일 목록, 댓글 목록 |
| UI 상태 | Zustand | 어떤 카드가 수정 중인지, 어떤 댓글 섹션이 열렸는지 |
| 로컬 상태 | useState | 입력 필드 값 |

Vue에서도 API 데이터는 Pinia의 `action`으로 fetch하고, 모달 열림 상태 같은 UI 상태는 별도로 관리하는 것과 같은 원칙.

---

## 트러블슈팅 — 로컬 서버 회색화면

**원인**: 포트 3000이 좀비 프로세스에 점령당한 상태에서 포트 3001로 서버를 실행했는데, `.env.local`의 `NEXTAUTH_URL=http://localhost:3000`이 설정되어 있어 미들웨어 리다이렉트가 3000번으로 가버렸다.

**해결**: Mac 재시작 → 좀비 프로세스 제거 → `pnpm dev`로 3000번 정상 실행.

**교훈**: `NEXTAUTH_URL`은 NextAuth가 리다이렉트 URL을 만들 때 기준으로 삼는 값. 개발 서버 포트가 바뀌면 이 값도 맞춰야 한다.
