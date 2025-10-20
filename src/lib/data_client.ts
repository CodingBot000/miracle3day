type FilterOperator =
  | "eq"
  | "neq"
  | "gte"
  | "gt"
  | "lte"
  | "lt"
  | "ilike"
  | "contains"
  | "cs"
  | "cd"
  | "in";

type Where = { col: string; op: string; val: any };
type Order = { col: string; ascending: boolean; nullsLast?: boolean };

type QueryError = { message: string; status?: number };

type QueryResult<T> = { data: T | T[] | null; error: QueryError | null; count: number | null };

const LOG_PREFIX = "[data-client]";

const isProd = typeof process !== "undefined" && process.env.NODE_ENV === "production";

function warn(scope: string, message: string) {
  if (isProd) return;
  console.warn(`${LOG_PREFIX} ${scope}: ${message}`);
}

function getBaseUrl() {
  if (typeof window !== "undefined") return "";

  const fromEnv =
    process.env.NEXT_PUBLIC_API_ROUTE ||
    process.env.INTERNAL_API_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  return (fromEnv || "http://localhost:3000").replace(/\/+$/, "");
}

function toQueryParam(value: unknown) {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return `${value ?? ""}`;
}

class QueryBuilder<T = any> implements PromiseLike<QueryResult<T>> {
  private table: string;
  private selects: string | undefined;
  private wheres: Where[] = [];
  private orders: Order[] = [];
  private limitN: number | undefined;
  private offsetN: number | undefined;
  private singleMode: "single" | "maybeSingle" | null = null;
  private headOnly = false;
  private countMode: string | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string, options?: { head?: boolean; count?: string }) {
    this.selects = columns ?? "*";
    this.headOnly = !!options?.head;
    this.countMode = options?.count ?? null;
    return this;
  }

  eq(column: string, value: any) {
    this.wheres.push({ col: column, op: "eq", val: value });
    return this;
  }

  neq(column: string, value: any) {
    this.wheres.push({ col: column, op: "neq", val: value });
    return this;
  }

  ilike(column: string, value: string) {
    this.wheres.push({ col: column, op: "ilike", val: value });
    return this;
  }

  in(column: string, values: any[]) {
    this.wheres.push({ col: column, op: "in", val: values });
    return this;
  }

  contains(column: string, value: any) {
    this.wheres.push({ col: column, op: "contains", val: value });
    return this;
  }

  gte(column: string, value: any) {
    this.wheres.push({ col: column, op: "gte", val: value });
    return this;
  }

  gt(column: string, value: any) {
    this.wheres.push({ col: column, op: "gt", val: value });
    return this;
  }

  lte(column: string, value: any) {
    this.wheres.push({ col: column, op: "lte", val: value });
    return this;
  }

  lt(column: string, value: any) {
    this.wheres.push({ col: column, op: "lt", val: value });
    return this;
  }

  match(criteria: Record<string, any>) {
    for (const [col, val] of Object.entries(criteria)) {
      this.eq(col, val);
    }
    return this;
  }

  filter(column: string, operator: string, value: any) {
    const op = (operator.toLowerCase() as FilterOperator) || "eq";
    this.wheres.push({ col: column, op, val: value });
    return this;
  }

  order(column: string, opts?: { ascending?: boolean; nullsLast?: boolean }) {
    this.orders.push({
      col: column,
      ascending: opts?.ascending !== false,
      nullsLast: opts?.nullsLast,
    });
    return this;
  }

  limit(n: number) {
    this.limitN = n;
    return this;
  }

  range(from: number, to: number) {
    this.offsetN = from;
    this.limitN = to - from + 1;
    return this;
  }

  single() {
    this.singleMode = "single";
    return this;
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this;
  }

  insert(): Promise<QueryResult<null>> {
    warn(this.table, "insert() is not implemented in compat mode.");
    return Promise.resolve({ data: null, error: null, count: null });
  }

  update(): Promise<QueryResult<null>> {
    warn(this.table, "update() is not implemented in compat mode.");
    return Promise.resolve({ data: null, error: null, count: null });
  }

  upsert(): Promise<QueryResult<null>> {
    warn(this.table, "upsert() is not implemented in compat mode.");
    return Promise.resolve({ data: null, error: null, count: null });
  }

  delete(): Promise<QueryResult<null>> {
    warn(this.table, "delete() is not implemented in compat mode.");
    return Promise.resolve({ data: null, error: null, count: null });
  }

  private buildSearchParams() {
    const params = new URLSearchParams();
    if (this.selects) params.set("select", this.selects);
    if (typeof this.limitN === "number") params.set("limit", String(this.limitN));
    if (typeof this.offsetN === "number") params.set("offset", String(this.offsetN));
    if (this.singleMode) params.set("single", this.singleMode);
    if (this.headOnly) params.set("head", "true");
    if (this.countMode) params.set("count", this.countMode);

    for (const where of this.wheres) {
      params.append(`${where.op}.${where.col}`, toQueryParam(where.val));
    }

    for (const order of this.orders) {
      const dir = order.ascending ? "asc" : "desc";
      const suffix = order.nullsLast ? ".nullslast" : "";
      params.append("order", `${order.col}.${dir}${suffix}`);
    }

    return params;
  }

  private async execInternal(): Promise<QueryResult<T>> {
    const params = this.buildSearchParams();
    const base = getBaseUrl();
    const url = `${base}/api/${this.table}?${params.toString()}`;

    try {
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        const message = await res.text();
        return { data: null, error: { status: res.status, message }, count: null };
      }

      if (this.headOnly) {
        const total = res.headers.get("x-total-count");
        return { data: null, error: null, count: total ? Number(total) : null };
      }

      const json = await res.json();

      if (this.singleMode === "single") {
        return { data: json ?? null, error: null, count: null };
      }

      if (this.singleMode === "maybeSingle") {
        if (json === null) return { data: null, error: null, count: null };
        if (Array.isArray(json)) return { data: json[0] ?? null, error: null, count: null };
        return { data: json ?? null, error: null, count: null };
      }

      return { data: json, error: null, count: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { data: null, error: { message }, count: null };
    }
  }

  async exec(): Promise<QueryResult<T>> {
    return this.execInternal();
  }

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execInternal().then(onfulfilled, onrejected);
  }
}

function createAuthCompat() {
  const emptySession = { session: null, user: null };

  const subscription = {
    unsubscribe() {
      warn("auth", "subscription.unsubscribe() invoked.");
    },
  };

  return {
    async getUser() {
      warn("auth", "getUser() is stubbed; returning null user.");
      return { data: { user: null }, error: null };
    },
    async getSession() {
      warn("auth", "getSession() is stubbed; returning null session.");
      return { data: { session: null }, error: null };
    },
    async signUp() {
      warn("auth", "signUp() is disabled in compat mode.");
      return { data: emptySession, error: null };
    },
    async signInWithPassword() {
      warn("auth", "signInWithPassword() is disabled in compat mode.");
      return { data: emptySession, error: null };
    },
    async signInWithOAuth() {
      warn("auth", "signInWithOAuth() is disabled in compat mode.");
      return { data: { url: null }, error: null };
    },
    async signInWithOtp() {
      warn("auth", "signInWithOtp() is disabled in compat mode.");
      return { data: emptySession, error: null };
    },
    async verifyOtp() {
      warn("auth", "verifyOtp() is disabled in compat mode.");
      return { data: emptySession, error: null };
    },
    async exchangeCodeForSession() {
      warn("auth", "exchangeCodeForSession() is disabled in compat mode.");
      return { data: emptySession, error: null };
    },
    async resetPasswordForEmail() {
      warn("auth", "resetPasswordForEmail() is disabled in compat mode.");
      return { data: {}, error: null };
    },
    async updateUser() {
      warn("auth", "updateUser() is disabled in compat mode.");
      return { data: emptySession, error: null };
    },
    async getUserIdentities() {
      warn("auth", "getUserIdentities() is disabled in compat mode.");
      return { data: { identities: [] }, error: null };
    },
    onAuthStateChange(callback?: (event: string, session: any) => void) {
      warn("auth", "onAuthStateChange() is stubbed; emitting SIGNED_OUT.");
      if (typeof callback === "function") {
        try {
          callback("SIGNED_OUT", emptySession);
        } catch (err) {
          warn("auth", `onAuthStateChange callback threw: ${err instanceof Error ? err.message : err}`);
        }
      }
      return { data: { subscription }, error: null };
    },
    async signOut() {
      warn("auth", "signOut() is disabled in compat mode.");
      return { error: null };
    },
    admin: {
      async deleteUser() {
        warn("auth.admin", "deleteUser() is disabled in compat mode.");
        return { data: null, error: null };
      },
    },
  };
}

function createStorageCompat() {
  return {
    from() {
      return {
        async createSignedUrl() {
          warn("storage", "createSignedUrl() is disabled in compat mode.");
          return { data: { signedUrl: null, expiration: 0 }, error: null };
        },
        getPublicUrl() {
          warn("storage", "getPublicUrl() is disabled in compat mode.");
          return { data: { publicUrl: "" }, error: null };
        },
        async upload() {
          warn("storage", "upload() is disabled in compat mode.");
          return { data: null, error: null };
        },
        async list() {
          warn("storage", "list() is disabled in compat mode.");
          return { data: [], error: null };
        },
        async remove() {
          warn("storage", "remove() is disabled in compat mode.");
          return { data: null, error: null };
        },
      };
    },
  };
}

const dataApiClient = {
  from<T = any>(table: string) {
    return new QueryBuilder<T>(table);
  },
  auth: createAuthCompat(),
  storage: createStorageCompat(),
};

export const backendClient = dataApiClient;

export function createClient() {
  return backendClient;
}

export const adminsAuthClient = backendClient.auth.admin;

export type BackendClient = ReturnType<typeof createClient>;

export type SessionUser = {
  id: string;
  email?: string | null;
  [key: string]: unknown;
};
