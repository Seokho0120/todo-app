# Task 07 — 인증 페이지 UI (로그인 + 회원가입)

## 비유

**비유하자면**, 로그인 폼은 "자동문 옆의 인터폰"이야.  
- 버튼 누르면(submit) 경비실(NextAuth 서버)에 연결
- 경비실이 "맞는 사람이에요"라고 하면 → 문이 열림 (/todos 이동)
- "모르는 사람이에요"라고 하면 → 문이 안 열리고 에러 메시지 표시

회원가입 폼은 "신규 입주자 등록 창구" — 경비실(NextAuth)이 아닌 관리사무소(직접 만든 /api/auth/register)에 신청하는 것.

---

## 왜 로그인과 회원가입 처리 방식이 다른가

### 로그인 → `signIn()` from next-auth/react
NextAuth가 세션을 관리하기 때문에, 로그인은 NextAuth의 `signIn()` 함수를 써야 한다. 이게 내부적으로 JWT 토큰을 발급하고 세션을 만들어줌.

```ts
const result = await signIn('credentials', { email, password, redirect: false })
```

- `redirect: false` → 자동 페이지 이동 막고, 결과를 직접 핸들링
- `result.error` 있으면 → 로그인 실패
- 없으면 → `router.push('/todos')` + `router.refresh()`

`router.refresh()`가 필요한 이유: 서버 컴포넌트가 새 세션 정보를 인식하게 하기 위해.

### 회원가입 → 직접 fetch
회원가입은 단순히 DB에 유저를 만드는 것. NextAuth 세션이 필요 없어서 직접 API를 호출하면 됨.

```ts
const res = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
})
```

---

## Vue 비교

Vue에서 로그인 폼 이런 식이었지:

```vue
<!-- Vue 3 -->
<script setup>
const handleSubmit = async () => {
  const res = await authStore.login({ email, password })
  if (res.error) errorMsg.value = res.error
  else router.push('/todos')
}
</script>
```

Next.js에서는:

```tsx
// React (Next.js)
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()  // Vue의 @submit.prevent와 동일
  const result = await signIn('credentials', { email, password, redirect: false })
  if (result?.error) setError('...')
  else router.push('/todos')
}
```

차이점:
- `@submit.prevent` → `onSubmit + e.preventDefault()`
- `v-model` → `value + onChange`
- `v-if` → 조건부 렌더링 `{error && <p>...</p>}`

---

## `'use client'` 가 필요한 이유

로그인/회원가입 폼은 사용자가 입력하고 버튼을 클릭해야 함 → 브라우저에서 동작해야 함.

Next.js는 기본적으로 서버에서 렌더링하는데, `useState`, `useRouter`, 이벤트 핸들러(`onClick`, `onSubmit`) 같은 건 서버에서 쓸 수 없음.

**비유하자면**, `'use client'`는 "이 코드는 고객(브라우저)이 직접 실행해야 해"라는 표시판.

```tsx
'use client'  // 이 줄 없으면 useState, useRouter 못 씀 → 빌드 에러
```

Vue SFC에서 `<script setup>`은 항상 브라우저에서 실행되는데, Next.js는 명시적으로 선언해줘야 한다는 차이.

---

## 라우트 그룹 `(auth)/` 의 의미

```
app/(auth)/login/page.tsx  →  URL: /login  (auth가 URL에 안 나타남)
app/(auth)/register/page.tsx  →  URL: /register
```

`(auth)`라는 폴더는 URL 경로에 포함되지 않음 — 그냥 코드 구조 정리용.

**비유하자면**, 파일 캐비닛에 "인증 관련"이라는 탭을 붙인 것. 탭 이름이 서류 번호에 들어가진 않음.

나중에 `(auth)` 그룹에 `layout.tsx`를 추가하면 로그인/회원가입 페이지에만 공통 레이아웃 적용 가능.

---

## 파일 구조 정리

```
components/auth/
  login-form.tsx     # 'use client' — 로그인 폼 컴포넌트
  register-form.tsx  # 'use client' — 회원가입 폼 컴포넌트

app/(auth)/
  login/page.tsx     # 서버 컴포넌트 — LoginForm을 중앙 배치
  register/page.tsx  # 서버 컴포넌트 — RegisterForm을 중앙 배치
```

페이지 파일은 서버 컴포넌트(Server Component)로 두고, 실제 상호작용 로직은 클라이언트 컴포넌트(`login-form.tsx`)에 분리하는 패턴 — Next.js의 권장 방식.
