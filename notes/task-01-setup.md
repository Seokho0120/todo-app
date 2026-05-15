# Task 1: 프로젝트 초기 세팅

## 무엇을 했나

Next.js 프로젝트를 만들고, 필요한 패키지를 설치하고, GitHub에 연결했다.

---

## pnpm create next-app

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --no-turbopack
```

Vue CLI의 `vue create`와 같은 역할. Next.js 기본 구조를 자동으로 만들어준다.

주요 옵션:
```
--typescript     TypeScript 사용
--tailwind       Tailwind CSS 포함
--app            App Router 사용 (Pages Router 아님)
--no-src-dir     src/ 폴더 없이 루트에 바로 app/ 생성
--no-turbopack   Turbopack 비활성화 (기본 webpack 사용)
```

생성된 주요 파일:
```
app/             페이지와 API가 들어가는 핵심 폴더
public/          정적 파일 (이미지 등)
package.json     의존성 목록
tsconfig.json    TypeScript 설정
next.config.ts   Next.js 설정
tailwind.config  Tailwind 설정
.env.local       환경변수 (gitignore에 자동 포함)
```

---

## 설치한 패키지

### 프로덕션 의존성

| 패키지 | 역할 | 비고 |
|--------|------|------|
| `next-auth@beta` | 로그인/세션 관리 | v5 beta = App Router 전용 버전 |
| `@prisma/client` | DB 쿼리 실행 | 런타임에 실제로 사용 |
| `bcryptjs` | 비밀번호 암호화 | 평문 저장 방지 |
| `@tanstack/react-query` | 서버 데이터 상태 관리 | Vue의 Pinia action+state 역할 |
| `zustand` | UI 전역 상태 관리 | Vue의 Pinia와 유사 |

### 개발 의존성

| 패키지 | 역할 |
|--------|------|
| `prisma` | 스키마 관리, 마이그레이션 CLI 도구 |
| `@types/bcryptjs` | bcryptjs TypeScript 타입 |

> **`@prisma/client` vs `prisma`의 차이**
> - `prisma` (devDependency): 개발할 때 `prisma migrate`, `prisma generate` 명령어 실행용
> - `@prisma/client` (dependency): 실제 앱에서 DB 쿼리할 때 사용하는 런타임 클라이언트

---

## shadcn/ui

UI 컴포넌트 라이브러리. Vuetify나 Element Plus처럼 미리 만들어진 컴포넌트를 제공하는데, 방식이 다르다.

**다른 라이브러리 방식:**
```
npm install vuetify
→ node_modules 안에 있음
→ 내가 코드 수정 불가
```

**shadcn/ui 방식:**
```
pnpm dlx shadcn@latest add button
→ components/ui/button.tsx 파일로 복사됨
→ 내 코드가 되어서 자유롭게 수정 가능
```

설치한 컴포넌트:
```
components/ui/button.tsx    버튼
components/ui/input.tsx     입력창
components/ui/card.tsx      카드
components/ui/checkbox.tsx  체크박스
```

---

## .env.local

환경변수 파일. DB 주소, 시크릿 키 같은 민감한 값을 코드에 직접 쓰지 않고 여기에 저장한다.

```
DATABASE_URL     Neon PostgreSQL 연결 주소
NEXTAUTH_SECRET  세션 암호화 키 (랜덤 문자열)
NEXTAUTH_URL     앱 주소 (개발: localhost:3000)
```

`.gitignore`에 자동 포함 → GitHub에 올라가지 않음.

---

## next-auth v5 beta를 쓰는 이유

next-auth는 v4 (stable)와 v5 (beta)가 있다.

| | v4 stable | v5 beta |
|--|-----------|---------|
| App Router 지원 | 불완전 | 완벽 |
| 상태 | 안정 | 2023년부터 베타 |

App Router 프로젝트에서는 v5가 사실상 표준. 2년 넘게 베타인 이유는 불안정해서가 아니라 팀이 API를 다듬는 중이라서.

---

## GitHub 연결

### 로컬 git config (개인 계정)

```bash
git config user.name "Seokho0120"
git config user.email "seokho0120@gmail.com"
```

`--global` 없이 설정하면 이 레포에만 적용됨. 다른 프로젝트(회사 계정)엔 영향 없음.

git config 레벨:
```
--system   맥 전체 시스템
--global   내 계정 전체 기본값
--local    이 레포만 (현재 설정, .git/config에 저장)
```

### SSH vs HTTPS

처음에 HTTPS로 연결했더니 회사 계정이 키체인에 캐시되어 있어서 403 에러 발생.
SSH로 바꾸니 해결됨.

```bash
# HTTPS (문제 발생)
git remote set-url origin https://github.com/Seokho0120/todo-app.git

# SSH (해결)
git remote set-url origin git@github.com:Seokho0120/todo-app.git
```

SSH는 키체인 계정과 무관하게 SSH 키로 인증하기 때문에 여러 GitHub 계정을 쓸 때 충돌이 없다.
