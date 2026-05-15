# Task 1: 프로젝트 초기 세팅

## 무엇을 했나

Next.js 프로젝트를 만들고, 필요한 패키지를 설치하고, GitHub에 연결했다.

---

## pnpm create next-app

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --no-turbopack
```

**비유하자면 — 집 짓기 전에 기본 골조를 세우는 것.**
벽, 지붕, 창문 구조만 잡혀 있는 빈 집. 여기에 가구(기능)를 하나씩 채워나가는 방식이다.

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
>
> **비유하자면** — `prisma`는 공사할 때 쓰는 도구(삽, 포크레인), `@prisma/client`는 완성된 집에 사는 사람이 쓰는 가구.
> - `prisma` (devDependency): 개발할 때 `prisma migrate`, `prisma generate` 명령어 실행용. 배포된 앱엔 필요 없음
> - `@prisma/client` (dependency): 실제 앱에서 DB 쿼리할 때 사용하는 런타임 클라이언트

---

## shadcn/ui

**비유하자면 — 이케아 가구.**
디자인은 이미 되어 있는데, 내 집(프로젝트)에 직접 가져다 놓는 방식이라 내 입맛대로 고칠 수 있다.

다른 라이브러리 방식 (Vuetify, Element Plus):
```
npm install vuetify
→ node_modules 안에 갇혀 있음
→ 내가 코드 수정 불가
```

shadcn/ui 방식:
```
pnpm dlx shadcn@latest add button
→ components/ui/button.tsx 파일로 직접 복사됨
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

**비유하자면 — 금고에 넣어두는 열쇠 모음.**
DB 주소, 시크릿 키 같은 민감한 값을 코드에 직접 쓰면 GitHub에 올라가서 누구나 볼 수 있다. `.env.local`에 따로 보관하고, `.gitignore`로 GitHub 업로드를 막는다.

```
DATABASE_URL     Neon PostgreSQL 연결 주소
NEXTAUTH_SECRET  세션 암호화 키 (랜덤 문자열)
NEXTAUTH_URL     앱 주소 (개발: localhost:3000)
```

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

**비유하자면 — 사무실 컴퓨터에서 개인 통장으로 돈 보내는 것.**
전체 설정을 바꾸는 게 아니라 이 프로젝트에서만 개인 계정을 쓰도록 설정한다.

```bash
git config user.name "Seokho0120"
git config user.email "seokho0120@gmail.com"
```

`--global` 없이 설정하면 이 레포에만 적용됨. 다른 프로젝트(회사 계정)엔 영향 없음.

git config 레벨:
```
--system   맥 전체 시스템 (모든 사용자)
--global   내 계정 전체 기본값
--local    이 레포만 (현재 설정, .git/config에 저장됨)
```

### SSH vs HTTPS

**비유하자면 — 열쇠(SSH) vs 비밀번호(HTTPS).**
비밀번호는 키체인에 저장된 회사 계정이 끼어들 수 있지만, 열쇠(SSH 키)는 내 개인 키로만 열리니까 충돌이 없다.

처음에 HTTPS로 연결했더니 회사 계정이 키체인에 캐시되어 있어서 403 에러 발생.
SSH로 바꾸니 해결됨.

```bash
# HTTPS (문제 발생)
git remote set-url origin https://github.com/Seokho0120/todo-app.git

# SSH (해결)
git remote set-url origin git@github.com:Seokho0120/todo-app.git
```
