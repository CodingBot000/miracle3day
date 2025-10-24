import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';

type MemberRow = Record<string, any> | null;

const LOOKUP_QUERIES = [
  `SELECT * FROM ${TABLE_MEMBERS} WHERE clerk_user_id = $1 LIMIT 1`,
  `SELECT * FROM ${TABLE_MEMBERS} WHERE id_uuid::text = $1 LIMIT 1`,
];

export async function findMemberByUserId(userId: string): Promise<MemberRow> {
  if (!userId) {
    console.log('findMemberByUserId: userId is empty');
    return null;
  }

  for (const sql of LOOKUP_QUERIES) {
    try {
      const rows = await q<Record<string, any>>(sql, [userId]);
      if (rows[0]) {
        console.log('findMemberByUserId: Found member with query:', sql);
        return rows[0];
      }
    } catch (error) {
      console.log('findMemberByUserId: Query failed:', sql, error instanceof Error ? error.message : error);
      // ignore column errors and continue to next strategy
    }
  }

  console.log('findMemberByUserId: No member found for userId:', userId);
  return null;
}
