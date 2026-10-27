/**
 * LOCAL-ONLY 목 데이터 어댑터.
 *
 * MOCK_DASHBOARD=1 일 때 createAdminClient()가 실제 Supabase 대신 이 클라이언트를
 * 반환한다. 관리자 대시보드(/admin/analytics/*, /admin/users)가 사용하는
 * PostgREST 쿼리 체인과 auth.admin API의 부분집합만 구현한다.
 *
 * 실제 배포에는 사용하지 않는다.
 */

type Row = Record<string, unknown>;

// ===== 결정론적 PRNG (매 요청 동일한 데이터) =====

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260902);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();

/** n일 전의 임의 시각을 ISO 문자열로. 시간대는 낮/저녁에 몰리게 가중. */
function isoDaysAgo(days: number) {
  const hourWeights = [1, 1, 1, 1, 1, 1, 2, 3, 4, 5, 6, 6, 5, 5, 6, 6, 7, 8, 10, 12, 12, 9, 5, 3];
  const total = hourWeights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  let hour = 0;
  for (let i = 0; i < hourWeights.length; i++) {
    r -= hourWeights[i];
    if (r <= 0) { hour = i; break; }
  }
  const d = new Date(NOW - days * DAY);
  d.setHours(hour, int(0, 59), int(0, 59), 0);
  return d.toISOString();
}

// ===== 데이터셋 =====

const CHARACTERS = ["charon_m", "charon_f", "minjun", "haeun", "doctor"] as const;
const FIRST = ["민준", "서연", "도윤", "하은", "시우", "지우", "예준", "수아", "주원", "지호", "은우", "다은"];
const LAST = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"];
const REFERRERS = [
  null, null, null,
  "https://www.google.com/", "https://www.google.com/", "https://search.naver.com/",
  "https://search.naver.com/", "https://www.instagram.com/", "https://t.co/abc",
  "https://www.youtube.com/", "https://m.blog.naver.com/post", "https://www.daum.net/",
];
const DEVICES = ["mobile", "mobile", "mobile", "desktop", "desktop", "tablet"];
const BROWSERS = ["Chrome", "Chrome", "Safari", "Safari", "Samsung Internet", "Edge", "Firefox"];
const OSES = ["iOS", "Android", "Android", "Windows", "macOS"];
const COUNTRIES = ["KR", "KR", "KR", "KR", "US", "JP", "CN", "TW", "CA"];

const SPAN_DAYS = 200;      // 데이터 생성 기간
const USER_COUNT = 430;

function buildUsers() {
  const users = [];
  for (let i = 0; i < USER_COUNT; i++) {
    // 최근으로 갈수록 가입자가 늘어나도록 제곱 분포로 편향
    const daysAgo = Math.floor(SPAN_DAYS * Math.pow(rand(), 1.6));
    const createdAt = isoDaysAgo(daysAgo);
    const name = `${pick(LAST)}${pick(FIRST)}`;
    users.push({
      id: `u_${String(i).padStart(4, "0")}`,
      email: `user${i}@example.com`,
      created_at: createdAt,
      last_sign_in_at: isoDaysAgo(Math.max(0, daysAgo - int(0, daysAgo))),
      user_metadata: { full_name: name },
      app_metadata: {},
    });
  }
  return users.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

const USERS = buildUsers();

function daysAgoOf(iso: string) {
  return Math.floor((NOW - new Date(iso).getTime()) / DAY);
}

function buildTables() {
  const readings: Row[] = [];
  const messages: Row[] = [];
  const compatibilities: Row[] = [];
  const stars: Row[] = [];

  let rIdx = 0, mIdx = 0, cIdx = 0;

  for (const u of USERS) {
    const signupDaysAgo = daysAgoOf(u.created_at);

    // 사용자별 분석 횟수: 대부분 0~2회, 소수의 파워 유저
    const roll = rand();
    const readingCount = roll > 0.94 ? int(5, 9) : roll > 0.72 ? int(2, 4) : roll > 0.28 ? 1 : 0;

    const userReadingIds: string[] = [];
    for (let k = 0; k < readingCount; k++) {
      const daysAgo = int(0, Math.max(0, signupDaysAgo));
      const id = `r_${String(rIdx++).padStart(5, "0")}`;
      const chatUsed = rand() > 0.42;
      readings.push({
        id,
        user_id: u.id,
        character_id: pick(CHARACTERS),
        name: (u.user_metadata.full_name as string),
        birth_year: int(1965, 2006),
        birth_month: int(1, 12),
        birth_day: int(1, 28),
        gender: rand() > 0.42 ? "female" : "male",
        title: "종합 사주 분석",
        chat_used: chatUsed,
        created_at: isoDaysAgo(daysAgo),
      });
      userReadingIds.push(id);

      // 대화 메시지
      if (chatUsed) {
        const turns = int(2, 14);
        const charId = pick(CHARACTERS);
        for (let t = 0; t < turns; t++) {
          messages.push({
            id: `m_${String(mIdx++).padStart(6, "0")}`,
            reading_id: id,
            role: t % 2 === 0 ? "user" : "assistant",
            content: t % 2 === 0 ? "올해 재물운이 어떤가요?" : "올해는 재물운이 안정적으로 흐릅니다.",
            character_id: charId,
            created_at: isoDaysAgo(Math.max(0, daysAgo - (rand() > 0.7 ? int(0, 2) : 0))),
          });
        }
      }

      // 궁합 분석
      if (rand() > 0.78) {
        compatibilities.push({
          id: `c_${String(cIdx++).padStart(5, "0")}`,
          reading_id: id,
          partner_name: `${pick(LAST)}${pick(FIRST)}`,
          created_at: isoDaysAgo(Math.max(0, daysAgo - int(0, 3))),
        });
      }
    }

    // 별(코인) 잔액 — 분석 이력이 있는 유저 위주로 보유
    if (readingCount > 0 || rand() > 0.75) {
      const paid = readingCount > 0 && rand() > 0.55;
      stars.push({
        user_id: u.id,
        balance: paid ? int(1, 40) * 10 : 0,
        created_at: u.created_at,
        updated_at: isoDaysAgo(int(0, Math.max(0, signupDaysAgo))),
      });
    }
  }

  // 페이지뷰 이벤트
  const events: Row[] = [];
  for (let d = SPAN_DAYS; d >= 0; d--) {
    // 최근일수록 트래픽 증가
    const base = 20 + Math.floor((SPAN_DAYS - d) * 0.35);
    const n = int(Math.floor(base * 0.6), Math.floor(base * 1.4));
    for (let i = 0; i < n; i++) {
      events.push({
        event_type: "page_view",
        referrer: pick(REFERRERS),
        device_type: pick(DEVICES),
        browser: pick(BROWSERS),
        os: pick(OSES),
        country_code: pick(COUNTRIES),
        created_at: isoDaysAgo(d),
      });
    }
  }

  const byDate = (a: Row, b: Row) =>
    String(a.created_at).localeCompare(String(b.created_at));

  return {
    saju_readings: readings.sort(byDate),
    saju_chat_messages: messages.sort(byDate),
    saju_compatibilities: compatibilities.sort(byDate),
    user_stars: stars,
    analytics_events: events.sort(byDate),
  } as Record<string, Row[]>;
}

const TABLES = buildTables();

// ===== PostgREST 쿼리 체인 흉내 =====

type Result = { data: unknown; count: number | null; error: null };

class MockQuery implements PromiseLike<Result> {
  private rows: Row[];
  private cols: string[] | null = null;
  private wantCount = false;
  private headOnly = false;
  private limitN: number | null = null;
  private singleRow = false;

  constructor(rows: Row[]) {
    this.rows = rows.slice();
  }

  select(cols?: string, opts?: { count?: string; head?: boolean }) {
    this.cols = cols && cols.trim() !== "*" ? cols.split(",").map((c) => c.trim()) : null;
    if (opts?.count) this.wantCount = true;
    if (opts?.head) this.headOnly = true;
    return this;
  }

  eq(col: string, v: unknown) { this.rows = this.rows.filter((r) => r[col] === v); return this; }
  neq(col: string, v: unknown) { this.rows = this.rows.filter((r) => r[col] !== v); return this; }
  gt(col: string, v: never) { this.rows = this.rows.filter((r) => (r[col] as never) > v); return this; }
  gte(col: string, v: never) { this.rows = this.rows.filter((r) => (r[col] as never) >= v); return this; }
  lt(col: string, v: never) { this.rows = this.rows.filter((r) => (r[col] as never) < v); return this; }
  lte(col: string, v: never) { this.rows = this.rows.filter((r) => (r[col] as never) <= v); return this; }

  in(col: string, vals: unknown[]) {
    const set = new Set(vals);
    this.rows = this.rows.filter((r) => set.has(r[col]));
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    const asc = opts?.ascending !== false;
    this.rows.sort((a, b) => {
      const x = a[col] as string | number;
      const y = b[col] as string | number;
      const cmp = x === y ? 0 : x > y ? 1 : -1;
      return asc ? cmp : -cmp;
    });
    return this;
  }

  limit(n: number) { this.limitN = n; return this; }
  single() { this.singleRow = true; return this; }
  maybeSingle() { this.singleRow = true; return this; }

  private project(r: Row): Row {
    if (!this.cols) return { ...r };
    const out: Row = {};
    for (const c of this.cols) out[c] = r[c];
    return out;
  }

  then<A = Result, B = never>(
    onfulfilled?: ((v: Result) => A | PromiseLike<A>) | null,
    onrejected?: ((e: unknown) => B | PromiseLike<B>) | null
  ): PromiseLike<A | B> {
    const count = this.wantCount ? this.rows.length : null;
    let data: unknown = null;
    if (!this.headOnly) {
      let rows = this.rows.map((r) => this.project(r));
      if (this.limitN !== null) rows = rows.slice(0, this.limitN);
      data = this.singleRow ? (rows[0] ?? null) : rows;
    }
    return Promise.resolve({ data, count, error: null } as Result).then(onfulfilled, onrejected);
  }
}

// ===== 클라이언트 =====

export function createMockAdminClient() {
  return {
    from(table: string) {
      return new MockQuery(TABLES[table] ?? []);
    },
    auth: {
      admin: {
        async listUsers(params?: { page?: number; perPage?: number }) {
          const perPage = params?.perPage ?? 50;
          const page = params?.page ?? 1;
          const start = (page - 1) * perPage;
          return {
            data: { users: USERS.slice(start, start + perPage), aud: "authenticated" },
            error: null,
          };
        },
        async getUserById(id: string) {
          return { data: { user: USERS.find((u) => u.id === id) ?? null }, error: null };
        },
      },
    },
  };
}

/**
 * 대시보드가 목 모드인지 여부.
 *
 * ⚠️ 운영 빌드에서는 환경변수가 설정돼 있어도 강제로 꺼진다.
 * 이 플래그가 켜지면 adminGuard가 인증 없이 관리자를 통과시키므로
 * (requireAdmin이 MOCK_ADMIN을 그냥 반환) 운영에 새어 나가면
 * 관리자 대시보드가 통째로 열린다. 실수로 켜지는 경로를 코드에서 차단한다.
 */
export const MOCK_DASHBOARD =
  process.env.NODE_ENV !== "production" && process.env.MOCK_DASHBOARD === "1";

/**
 * 서버 컴포넌트용 목 클라이언트.
 * 비로그인 방문자로 동작하며, 테이블 쿼리는 admin 목과 동일한 데이터셋을 본다.
 */
/**
 * Supabase 없이 운영할 때(회원 기능 꺼짐) 쓰는 비로그인 클라이언트.
 * 운영에서도 쓴다 — 목 데이터를 보여주면 안 되므로 모든 조회가 빈 결과다.
 */
export function createSignedOutServerClient() {
  return { ...createMockServerClient(), from: () => new MockQuery([]) };
}

export function createMockServerClient() {
  const noSession = { data: { user: null, session: null }, error: null };
  return {
    from(table: string) {
      return new MockQuery(TABLES[table] ?? []);
    },
    auth: {
      async getUser() {
        return { data: { user: null }, error: null };
      },
      async getSession() {
        return { data: { session: null }, error: null };
      },
      async signOut() {
        return { error: null };
      },
      async signInWithOAuth() {
        return { data: { provider: null, url: null }, error: { message: "MOCK_DASHBOARD 모드에서는 로그인할 수 없습니다." } };
      },
      async signInWithPassword() { return noSession; },
      async signInWithOtp() { return noSession; },
      async signUp() { return noSession; },
      async verifyOtp() { return noSession; },
      async exchangeCodeForSession() { return noSession; },
      async resetPasswordForEmail() { return { data: {}, error: null }; },
    },
  };
}
