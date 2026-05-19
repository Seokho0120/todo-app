# Task 12: GitHub Actions CI/CD

## 무엇을 했나

GitHub Actions로 CI(Continuous Integration) 파이프라인을 구성했다. 코드를 push할 때마다 타입 체크, 린트, 테스트가 자동 실행된다. 이후 CD(Continuous Deployment)를 추가해 CI 통과 시 자동 배포까지 연결한다.

---

## CI/CD란?

**비유하자면 — 공장 품질 검사 라인.**

- **CI (Continuous Integration)** — 코드를 합칠 때마다 자동으로 품질 검사. 타입 오류, 린트 경고, 테스트 실패를 즉시 발견.
- **CD (Continuous Deployment)** — 검사를 통과한 코드만 자동으로 프로덕션에 배포.

Vue 프로젝트에서 `npm run lint && npm run test`를 push 전에 수동으로 돌리던 것을 GitHub이 자동으로 대신하는 것.

---

## GitHub Actions란?

**비유하자면 — GitHub 안에 내장된 자동화 알바생.**

코드가 push되면 GitHub이 자체 Linux 서버(Ubuntu)를 켜서, 내가 지정한 명령어들을 순서대로 실행하고 결과를 커밋에 ✅/❌로 표시해준다.

---

## 파일 구조

```
.github/
└── workflows/
    └── ci.yml   ← 이 파일 하나가 전부
```

`.github/workflows/` 폴더 안에 `.yml` 파일을 놓으면 GitHub이 자동으로 인식한다. 여러 개 만들 수 있다 (`ci.yml`, `deploy.yml` 등).

---

## ci.yml 전체 해설

```yaml
name: CI
```
GitHub Actions 탭에서 보이는 워크플로우 이름.

---

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

**언제 실행할지** — 트리거 정의.
- `push`: main에 push할 때마다 실행
- `pull_request`: main으로 PR 올릴 때마다 실행

---

```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
```

**어디서 실행할지** — GitHub이 제공하는 무료 Linux 서버. 매번 깨끗한 환경에서 시작한다 (내 로컬 환경과 무관).

---

```yaml
steps:
  - name: 코드 체크아웃
    uses: actions/checkout@v4
```

GitHub 저장소 코드를 서버에 내려받는다. 이게 없으면 서버에 코드 자체가 없다.

`uses`는 GitHub이나 커뮤니티가 만든 재사용 가능한 스크립트 묶음(액션)을 가져다 쓰는 것. npm에서 패키지 install하는 것과 비슷한 개념.

---

```yaml
  - name: pnpm 설치
    uses: pnpm/action-setup@v4
    with:
      version: 10

  - name: Node.js 설정
    uses: actions/setup-node@v4
    with:
      node-version: 20
      cache: pnpm
```

`pnpm`은 GitHub 기본 서버에 없어서 따로 설치. `cache: pnpm`으로 `node_modules`를 캐시해서 다음 실행 때 install 속도를 높인다.

---

```yaml
  - name: 의존성 설치
    run: pnpm install

  - name: Prisma 클라이언트 생성
    run: pnpm prisma generate
```

`run`은 터미널 명령어 직접 실행. Prisma 타입이 없으면 타입 체크가 실패하므로 먼저 생성.

---

```yaml
  - name: 타입 체크
    run: pnpm tsc --noEmit

  - name: 린트
    run: pnpm lint

  - name: 테스트
    run: pnpm test --run
```

핵심 검증 3단계:
- `tsc --noEmit` — TypeScript 타입 오류 검사 (JS 파일 생성 없이 검사만)
- `lint` — ESLint 코드 스타일 검사
- `test --run` — Vitest 테스트 실행 (`--run`은 watch 모드 없이 1회 실행)

하나라도 실패하면 이후 steps는 실행되지 않고 ❌ 표시.

---

## 실행 흐름

```
push to main
    ↓
GitHub 서버(Ubuntu) 켜짐
    ↓
코드 내려받기 → pnpm/Node 설치 → pnpm install
    ↓
prisma generate → tsc → lint → test
    ↓
전부 통과 → ✅  /  하나라도 실패 → ❌
```

---

## CI vs CD 역할 분담

| | 역할 | 담당 |
|--|------|------|
| **CI** | 코드 검증 (타입체크, 린트, 테스트) | GitHub Actions |
| **CD** | 검증 통과 후 자동 배포 | GitHub Actions → Vercel CLI |

Vercel GitHub 연동의 자동배포를 끄고, GitHub Actions가 CI 통과 후 직접 Vercel에 배포 명령을 내리는 구조. 현업에서 Jenkins/GitHub Actions가 CI/CD를 통합 관리하는 패턴과 동일하다.
