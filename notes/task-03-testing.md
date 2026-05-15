# Task 3: 테스트 환경 설정 (Vitest + React Testing Library)

## 무엇을 했나

테스트 코드를 실행할 수 있는 환경을 세팅했다. 실제 테스트 코드는 각 기능을 만들면서 같이 작성한다.

---

## 테스트 코드란?

**내 코드가 의도대로 동작하는지 확인하는 코드.**

비유하자면 — 공장에서 제품을 만들고 나서 품질 검사하는 것과 같다.

```ts
it('1 + 1은 2여야 한다', () => {
  expect(1 + 1).toBe(2)  // ✅ 통과
})

it('로그인 버튼이 화면에 보여야 한다', () => {
  render(<LoginForm />)
  expect(screen.getByText('로그인')).toBeInTheDocument()  // ✅ 통과
})
```

### 왜 테스트 코드를 쓰냐면

기능이 늘어날수록 코드를 수정했을 때 **다른 기능이 망가지는지** 직접 하나하나 확인하기가 너무 힘들다.

예시:
1. 할일 삭제 기능을 수정함
2. 실수로 할일 추가가 안 되게 됨
3. 테스트가 없으면 → 직접 화면 들어가서 클릭해봐야 발견
4. 테스트가 있으면 → `pnpm test` 실행하면 바로 ❌ 표시로 발견

---

## 설치한 라이브러리

### Vitest

**테스트 실행기 (Test Runner).** `it()`, `expect()` 같은 테스트 문법을 제공하고 결과를 보여준다.

비유: 시험지를 채점해주는 선생님. 테스트 코드(시험지)를 작성하면 Vitest가 돌려서 맞았는지 틀렸는지 알려준다.

Jest와 거의 같은 문법인데, **Vite 기반이라 훨씬 빠르다.**

```bash
pnpm test --run   # 한 번 실행하고 종료
pnpm test         # watch 모드 (파일 변경 감지해서 자동 재실행)
```

### @testing-library/react

**React 컴포넌트를 테스트용으로 렌더링하고, 사용자 행동을 시뮬레이션하는 도구.**

비유: 실제 브라우저 없이 "가상의 화면"을 만들어서 클릭, 입력 등을 테스트할 수 있게 해준다.

```ts
import { render, screen } from '@testing-library/react'

render(<LoginForm />)                          // 컴포넌트 렌더링
screen.getByText('로그인')                     // 텍스트로 요소 찾기
screen.getByRole('button', { name: '제출' })  // 역할로 요소 찾기
```

### @testing-library/jest-dom

**DOM 관련 검증 문법을 추가해주는 확장 패키지.**

기본 `expect`만으로는 부족한 "화면에 있는지", "비활성화됐는지" 같은 검증을 쓸 수 있게 해준다.

```ts
// jest-dom 없이
expect(element).not.toBe(null)

// jest-dom 있으면
expect(element).toBeInTheDocument()   // 화면에 있는지
expect(button).toBeDisabled()          // 비활성화됐는지
expect(input).toHaveValue('hello')     // 입력값 확인
```

### jsdom

**Node.js 환경에서 브라우저 DOM을 시뮬레이션해주는 라이브러리.**

비유: Node.js는 서버 환경이라 원래 `document`, `window` 같은 브라우저 API가 없다. jsdom이 가짜 브라우저 환경을 만들어줘서 테스트할 수 있게 된다.

---

## 설정 파일

### vitest.config.ts

```ts
export default defineConfig({
  plugins: [react()],       // React JSX 변환
  test: {
    environment: 'jsdom',   // 가짜 브라우저 환경 사용
    setupFiles: ['./vitest.setup.ts'],  // 테스트 전 실행할 설정
    globals: true,          // it(), expect() 를 import 없이 사용
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },  // @/ 경로 인식
  },
})
```

### vitest.setup.ts

```ts
import '@testing-library/jest-dom'  // toBeInTheDocument() 등 DOM matcher 활성화
```

---

## 실행 방법

```bash
pnpm test          # watch 모드 (개발 중에 사용)
pnpm test --run    # 한 번만 실행하고 종료 (CI에서 사용)
pnpm test:ui       # 브라우저 UI로 결과 확인
```
