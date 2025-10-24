import { getTableColumns } from "@/lib/meta";
import { allowList, BLACKLIST_GLOBAL, extraBlacklist, ALLOW_ALL_IN_DEV } from "./table-policy";

const NAME_MATCH = (col: string) => {
  const c = col.toLowerCase();
  return {
    admin: /(^|_)is_admin($|_)/.test(c) || /(^|_)admin($|_)/.test(c),
    role: /(^|_)role($|_)/.test(c),
    emailVerified: /(^|_)email_verified($|_)/.test(c),
    userOwner: /(^|_)(owner_id|user_id)($|_)/.test(c),
    money: /(points?|balance|credit|debit|amount|price|total)s?$/.test(c),
    audit: /(created_at|updated_at|deleted_at)$/.test(c),
    isId: c === "id",
  };
};

export async function deriveAllowedColumns(table: string, bodyKeys: string[]) {
  // 1) allowList가 있으면 그 키만 허용
  if (allowList[table]?.length) {
    const allow = allowList[table].map((s) => s.toLowerCase());
    return bodyKeys.filter((k) => allow.includes(k.toLowerCase()));
  }

  // 2) Dev 완전 허용 (단, PK/Identity/Generated은 차단 권장)
  if (ALLOW_ALL_IN_DEV && process.env.NODE_ENV !== "production") {
    const cols = await getTableColumns(table);
    const hardBlock = new Set(
      cols
        .filter((c) => c.is_primary_key || c.is_identity === "YES" || c.is_generated === "ALWAYS")
        .map((c) => c.column_name.toLowerCase())
    );
    return bodyKeys.filter((k) => !hardBlock.has(k.toLowerCase()));
  }

  // 3) Prod(또는 규칙 모드)
  const cols = await getTableColumns(table);
  const existing = new Set(cols.map((c) => c.column_name.toLowerCase()));

  const hardBlock = new Set<string>();
  for (const c of cols) {
    const name = c.column_name.toLowerCase();
    const m = NAME_MATCH(name);
    if (c.is_primary_key || c.is_identity === "YES" || c.is_generated === "ALWAYS") hardBlock.add(name);
    if (m.isId || m.admin || m.role || m.emailVerified || m.userOwner || m.money || m.audit) hardBlock.add(name);
  }
  BLACKLIST_GLOBAL.forEach((x: string) => hardBlock.add(x.toLowerCase()));
  (extraBlacklist[table] || []).forEach((x: string) => hardBlock.add(x.toLowerCase()));

  return bodyKeys
    .filter((k: string) => existing.has(k.toLowerCase()))
    .filter((k: string) => !hardBlock.has(k.toLowerCase()));
}
