# Task 06 — 회원가입 API (POST /api/auth/register)

## 비유

**비유하자면**, 회원가입 API는 카페의 "신규 회원 가입 창구"야.  
손님이 이름(이메일)과 비밀번호를 쓴 종이를 주면, 직원이:
1. 빈칸 없는지 확인 (유효성 검사)
2. 이미 등록된 회원인지 확인 (중복 체크)
3. 비밀번호를 암호화해서 금고에 넣음 (bcrypt 해시)
4. 회원증 발급 (DB에 저장 후 id, email 반환)

---

## 왜 이렇게 만드나

### Next.js App Router의 API Route
Express에서 `app.post('/register', handler)` 쓰던 것처럼, Next.js에서는 `app/api/auth/register/route.ts` 파일을 만들고 `export async function POST` 를 선언하면 그게 곧 API 엔드포인트가 된다.

파일 경로 = URL 경로라는 게 핵심.

```
app/api/auth/register/route.ts → POST /api/auth/register
```

### bcrypt — 왜 비밀번호를 그냥 저장하면 안 되나
DB가 털리면 비밀번호가 그대로 노출됨. bcrypt는 단방향 해시 + salt를 섞어서, 같은 비밀번호도 매번 다른 값으로 저장된다. 그래서 DB를 봐도 원본 비밀번호를 알 수 없음.

cost factor 12 = 해싱 속도 조절 (높을수록 느리고 안전). 너무 크면 서버 부담.

```ts
const hashed = await bcrypt.hash(password, 12)
```

### Vue 비교
Vue에서 Express 쓸 때 이런 식이었지:

```js
// Express (Vue 프로젝트 백엔드)
app.post('/register', async (req, res) => {
  const { email, password } = req.body
  // ...
  res.status(201).json(user)
})
```

Next.js에서는 이렇게:

```ts
// app/api/auth/register/route.ts
export async function POST(req: Request) {
  const { email, password } = await req.json()
  // ...
  return NextResponse.json(user, { status: 201 })
}
```

구조는 거의 똑같음. `req.body` → `req.json()`, `res.json()` → `NextResponse.json()`으로 바뀐 것 뿐.

---

## 주요 구현 포인트

### 유효성 검사 순서
```ts
// 1. 타입 체크 먼저 (typeof)
if (typeof email !== 'string' || typeof password !== 'string') → 400

// 2. 빈값 체크
if (!normalizedEmail || !password) → 400

// 3. 길이 제한
if (password.length < 6) → 400
if (password.length > 72) → 400  // bcrypt는 72자 초과 시 잘라냄

// 4. 중복 체크
const existing = await prisma.user.findUnique(...)
if (existing) → 409
```

### 이메일 정규화
`User@EXAMPLE.com`과 `user@example.com`이 다른 계정으로 처리되는 걸 막기 위해 소문자로 통일.
```ts
const normalizedEmail = email.trim().toLowerCase()
```

### try/catch 감싸기
DB 연결 실패, JSON 파싱 오류 등 예상 못한 에러에 대비.
```ts
try {
  // 모든 async 작업
} catch {
  return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
}
```

---

## 응답 코드 정리

| 상황 | 상태 코드 |
|------|---------|
| 성공 | 201 Created |
| 입력값 없음/형식 오류 | 400 Bad Request |
| 중복 이메일 | 409 Conflict |
| 서버 오류 | 500 Internal Server Error |
