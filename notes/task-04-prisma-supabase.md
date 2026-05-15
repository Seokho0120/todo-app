# Task 4: Prisma 스키마 + Supabase DB 연결

## 무엇을 했나

Supabase에서 PostgreSQL DB를 만들고, Prisma 스키마를 작성해서 실제 DB 테이블을 생성했다.

---

## Supabase란?

**비유하자면 — 인터넷에 있는 PostgreSQL 창고.**

백엔드 공부할 때는 로컬에 PostgreSQL을 직접 설치해서 `localhost:5432`로 접속했다. 근데 Vercel에 배포하면 Vercel 서버는 내 맥에 접근할 수 없어서 DB를 못 찾는다.

```
로컬 PostgreSQL                 Supabase
────────────────────────        ─────────────────────────
내 맥에만 있음                  인터넷 어디서든 접근 가능
localhost:5432                  aws-xxx.supabase.com:5432
배포하면 연결 불가              Vercel에서도 연결 가능
무료                            무료 (학습용으로 충분)
```

Supabase는 PostgreSQL + 웹 대시보드(Table Editor)를 제공하는 클라우드 서비스다. 인지도가 높고 커뮤니티가 크다.

---

## Prisma란?

**비유하자면 — DB와 내 코드 사이의 통역사.**

SQL을 직접 쓰지 않고 TypeScript 코드로 DB를 조작할 수 있게 해준다.

```
백엔드 공부 때 (SQL 직접)         Prisma 방식
────────────────────────────────────────────────
db.query('SELECT * FROM users')   prisma.user.findMany()
db.query('INSERT INTO users...')  prisma.user.create({ data: {...} })
```

### Prisma의 두 패키지

| 패키지 | 역할 | 설치 위치 |
|--------|------|---------|
| `prisma` | CLI 도구 (migrate, generate 명령어) | devDependency |
| `@prisma/client` | 앱에서 실제 DB 쿼리하는 클라이언트 | dependency |

**비유하자면** — `prisma`는 공사할 때 쓰는 포크레인, `@prisma/client`는 완성된 건물에 사는 사람이 쓰는 가구.

---

## Prisma 스키마 (schema.prisma)

**비유하자면 — DB 설계도.**

어떤 테이블이 있고, 각 테이블에 어떤 컬럼이 있는지, 테이블 간 관계는 어떤지를 정의하는 파일이다.

```prisma
model User {
  id        Int       @id @default(autoincrement())  // 자동 증가 PK
  email     String    @unique                         // 중복 불가
  password  String
  todos     Todo[]    // User가 여러 Todo를 가짐 (1:N)
  comments  Comment[]
  createdAt DateTime  @default(now()) @map("created_at")

  @@map("users")  // 실제 DB 테이블 이름
}
```

`@@map("users")` — Prisma 모델 이름은 `User`(대문자)지만 DB 테이블은 `users`(소문자)로 저장.
`@map("created_at")` — Prisma 필드명은 camelCase(`createdAt`)지만 DB 컬럼은 snake_case(`created_at`).

### 테이블 관계 (Relations)

```prisma
model Todo {
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId Int  @map("user_id")
}
```

`onDelete: Cascade` — 유저가 삭제되면 그 유저의 할일도 자동 삭제.

---

## DB 테이블이란?

**비유하자면 — 엑셀 시트.**

```
users 테이블
┌────┬──────────────────┬──────────────┬─────────────────────┐
│ id │ email            │ password     │ created_at          │
├────┼──────────────────┼──────────────┼─────────────────────┤
│  1 │ test@example.com │ $2b$10$xxx.. │ 2026-05-15 07:04:00 │
│  2 │ hello@gmail.com  │ $2b$10$yyy.. │ 2026-05-15 07:05:00 │
└────┴──────────────────┴──────────────┴─────────────────────┘
```

- **테이블** = 시트 하나 (users, todos, comments)
- **컬럼** = 열 (id, email, password, created_at)
- **row** = 행 하나 = 실제 데이터 한 건

---

## 마이그레이션이란?

**비유하자면 — DB에 공사 신청서 넣고 실제 공사하는 것.**

`schema.prisma`(설계도)를 작성하면 Prisma가 SQL로 변환해서 실제 DB에 테이블을 만든다.

```bash
pnpm prisma migrate dev --name init
```

실행하면:
1. `schema.prisma` 읽음
2. SQL 파일 생성 (`prisma/migrations/20260515_init/migration.sql`)
3. Supabase DB에 SQL 실행 → 테이블 생성
4. Prisma Client 재생성 (TypeScript 타입 업데이트)

`_prisma_migrations` 테이블 — Prisma가 자동으로 만드는 **공사 일지**. 어떤 마이그레이션이 적용됐는지 기록. 직접 건드리지 않음.

---

## 연결 문자열 두 개인 이유 (Supabase 특이사항)

Supabase는 연결 방식이 두 가지다:

| | DATABASE_URL | DIRECT_URL |
|--|-------------|------------|
| 포트 | 6543 | 5432 |
| 방식 | Connection Pooler | Direct connection |
| 용도 | 앱 실행 (Vercel 서버리스) | 마이그레이션 |

**비유하자면** — Vercel은 요청마다 새 연결을 맺는 서버리스 환경이라, 매번 직접 DB에 연결하면 연결이 너무 많아진다. Pooler가 중간에서 연결을 재사용해서 효율적으로 관리해준다.

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // Pooler - 앱 실행용
  directUrl = env("DIRECT_URL")     // Direct - 마이그레이션용
}
```

---

## lib/prisma.ts — 싱글턴 패턴

```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**비유하자면 — DB 연결을 딱 하나만 만들어두고 재사용하는 것.**

Next.js 개발 모드에서는 파일을 저장할 때마다 코드가 재실행된다. 매번 새 PrismaClient를 만들면 연결이 계속 쌓인다. `globalThis`에 저장해서 이미 있으면 재사용하는 패턴.

---

## Prisma Studio vs Supabase Table Editor

둘 다 DB 데이터를 GUI로 조회/수정하는 도구. 기능이 거의 동일하다.

| | Prisma Studio | Supabase Table Editor |
|--|---------------|-----------------------|
| 실행 | `pnpm prisma studio` → localhost:5555 | 웹 대시보드 |
| 접근 | 로컬에서만 | 어디서든 |

Supabase를 쓰는 경우 Table Editor가 더 편하다.

---

## 겪은 문제들

### Prisma 7 → 6 다운그레이드
Prisma 7에서 `schema.prisma`에 `url` 작성 방식이 없어졌다. 학습 자료 대부분이 v6 기준이라 v6으로 다운그레이드.

### `.env` vs `.env.local`
- Next.js는 `.env.local`을 읽음
- Prisma CLI는 `.env`를 읽음
- 해결: `.env` 파일을 따로 만들어서 DB URL 두 줄만 넣음
- 둘 다 `.gitignore`에 포함되어 GitHub에 올라가지 않음

### 회사 네트워크 SSL 문제
```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm prisma migrate dev --name init
```
회사 네트워크의 자체 서명 인증서 때문에 발생. SSL 검증 우회 옵션으로 해결.
