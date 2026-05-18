# Task 09 — TanStack Query Hooks + Zustand Store

## 왜 이게 필요한가

API는 다 만들었는데, UI에서 API를 어떻게 호출하고 결과를 어떻게 관리하느냐가 문제다.

그냥 axios.get()으로 직접 호출하면 이걸 전부 손으로 짜야 한다:

```ts
// 직접 관리할 경우 (TanStack Query 없이)
const todos = ref([])
const isLoading = ref(false)
const error = ref(null)

async function fetchTodos() {
  isLoading.value = true
  try {
    const res = await axios.get('/api/todos')
    todos.value = res.data
  } catch (e) {
    error.value = e
  } finally {
    isLoading.value = false
  }
}
```

TanStack Query는 이걸 대신 해준다:

```ts
const { data: todos, isLoading, error } = useTodos()  // 끝
```

---

## TanStack Query

**비유하자면**, TanStack Query는 "스마트 냉장고"야.

식재료(데이터)를 알아서 신선하게 유지하고, 오래됐으면 자동으로 새걸 가져오고, 꺼내달라고 하면 바로 줘. 직접 관리하면 유통기한 체크, 쇼핑, 정리까지 다 내가 해야 하는 거고.

Vue에서 이미 써봤으니 동작 방식은 익숙할 것. Next.js에서도 완전히 동일하게 동작한다. 차이점은 fetch 대신 axios를 쓴 것뿐.

---

## useQuery vs useMutation

### useQuery — 데이터 조회

**비유하자면**, `useQuery`는 "구독"이야. 한 번 구독해두면 데이터가 바뀔 때마다 알아서 업데이트해줌.

```ts
export function useTodos() {
  return useQuery<Todo[]>({
    queryKey: ['todos'],   // 이 데이터의 이름표 (캐시 키)
    queryFn: () => axios.get<Todo[]>('/api/todos').then(r => r.data),
  })
}
```

컴포넌트에서:
```ts
const { data: todos, isLoading, error } = useTodos()
// isLoading: 불러오는 중
// error: 실패
// data: 성공 시 할일 목록
```

### useMutation — 데이터 변경 (생성/수정/삭제)

**비유하자면**, `useMutation`은 "주문서"야. 주문하고(API 호출), 주문 완료되면(onSuccess) 냉장고 재고를 다시 확인하는(invalidateQueries) 것.

```ts
export function useCreateTodo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      axios.post<Todo>('/api/todos', { content }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
    //                ↑ 할일 추가 성공하면 목록 다시 불러와
  })
}
```

Vue 비교:
```ts
// Vue + Pinia 방식
const store = useTodoStore()
await store.createTodo(content)  // action 직접 호출
await store.fetchTodos()         // 목록 갱신은 내가 직접 해야 함

// TanStack Query 방식
const { mutate: createTodo } = useCreateTodo()
createTodo(content)  // onSuccess에서 알아서 목록 갱신됨
```

---

## queryKey와 invalidateQueries

**비유하자면**, `queryKey`는 냉장고 칸마다 붙인 라벨이야.

```ts
queryKey: ['todos']              // 할일 목록 칸
queryKey: ['comments', todoId]   // todoId번 할일의 댓글 칸
```

`invalidateQueries`는 "이 칸 유통기한 만료" 스티커를 붙이는 것. 다음에 그 칸을 열면(컴포넌트가 해당 data에 접근하면) 자동으로 새 데이터를 가져옴.

```ts
// 댓글 추가 성공 시, todoId=3의 댓글 캐시만 무효화
qc.invalidateQueries({ queryKey: ['comments', 3] })
// → useComments(3)이 자동으로 재요청됨
// → useComments(5)는 건드리지 않음 (다른 칸이니까)
```

---

## Zustand — UI 상태만 관리

TanStack Query가 있는데 왜 Zustand까지 써야 하나?

**TanStack Query는 서버 데이터 전용**이라서, 서버랑 관계없는 UI 상태는 관리를 못한다.

"지금 3번 할일을 수정 중이다" — 이건 서버에 없는 정보. DB에 저장할 필요도 없고, API 호출도 필요 없음. 그냥 화면에서만 쓰는 상태.

**비유하자면**, TanStack Query는 "창고 재고 시스템"이고, Zustand는 "직원들이 보는 화이트보드"야.

- 창고 재고 (할일 목록, 댓글) → TanStack Query
- 화이트보드 (지금 누가 뭘 수정 중인지) → Zustand

```ts
// 3번 할일의 연필 버튼 클릭
setEditingTodoId(3)   // Zustand에만 저장. 서버 요청 없음.

// 수정 완료
updateTodo({ id: 3, data: { content: '수정된 내용' } })  // 그때 서버 요청
setEditingTodoId(null)  // 편집 모드 종료
```

Vue 비교:
```ts
// Pinia에서 UI 상태 + 서버 데이터를 한 store에서 다 관리했던 것
const store = useTodoStore()
store.editingId = 3       // UI 상태
store.todos = res.data    // 서버 데이터

// 이 프로젝트에서는 역할을 나눔
const { setEditingTodoId } = useUIStore()   // UI → Zustand
const { data: todos } = useTodos()          // 서버 → TanStack Query
```

### 관리하는 UI 상태 3가지

```ts
{
  editingTodoId: null,      // 연필 버튼 클릭 시 해당 할일 id 저장
  editingCommentId: null,   // 댓글 수정 버튼 클릭 시 해당 댓글 id 저장
  openCommentTodoId: null,  // 댓글 펼치기 클릭 시 해당 할일 id 저장
}
```

이 값들이 null이면 "편집 안 하는 상태", 특정 id가 들어있으면 "그 id의 항목이 편집 중인 상태"를 의미한다.

---

## axios를 쓰는 이유 (fetch 대신)

```ts
// fetch 방식 — 보일러플레이트가 많음
queryFn: async () => {
  const res = await fetch('/api/todos')
  if (!res.ok) throw new Error('실패')   // 직접 에러 체크
  return res.json()                      // 직접 JSON 변환
}

// axios 방식 — 깔끔함
queryFn: () => axios.get<Todo[]>('/api/todos').then(r => r.data)
// 4xx/5xx 자동 에러 throw
// JSON 자동 파싱
// 응답 타입 제네릭으로 바로 지정
```

현업에서 axios + TanStack Query 조합이 표준처럼 쓰임. 나중에 인터셉터(토큰 자동 주입, 401 자동 처리)를 추가하기도 편하다.

이 프로젝트는 NextAuth가 인증을 쿠키로 자동 관리해서 당장 인터셉터가 필요하진 않지만, 추후 확장성과 현업 경험을 위해 axios를 선택.

---

## 파일 구조 정리

```
hooks/
  use-todos.ts      useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo
  use-comments.ts   useComments, useCreateComment, useUpdateComment, useDeleteComment

store/
  ui-store.ts       editingTodoId, editingCommentId, openCommentTodoId
```

hooks는 서버 데이터, store는 UI 상태. 역할이 완전히 다르다.
