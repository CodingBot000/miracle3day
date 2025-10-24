import { q } from "@/lib/db";

export type ColumnMeta = {
  column_name: string;
  is_identity: "YES" | "NO" | null;
  is_generated: "ALWAYS" | "NEVER" | null;
  column_default: string | null;
  data_type: string | null;
  is_nullable: "YES" | "NO" | null;
  is_primary_key: boolean;
};

export async function getTableColumns(table: string): Promise<ColumnMeta[]> {
  const cols = await q<ColumnMeta>(
    `
      WITH pks AS (
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
         AND tc.table_schema = kcu.table_schema
        WHERE tc.table_schema = 'public'
          AND tc.table_name = $1
          AND tc.constraint_type = 'PRIMARY KEY'
      )
      SELECT
        c.column_name,
        c.is_identity,
        c.is_generated,
        c.column_default,
        c.data_type,
        c.is_nullable,
        (c.column_name IN (SELECT column_name FROM pks)) AS is_primary_key
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = $1
      ORDER BY c.ordinal_position;
    `,
    [table]
  );

  return cols;
}
