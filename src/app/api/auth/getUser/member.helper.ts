import { log } from '@/utils/logger';
import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';

type MemberRow = Record<string, any> | null;

const LOOKUP_QUERIES = [
  `SELECT * FROM ${TABLE_MEMBERS} WHERE id_uuid::text = $1 LIMIT 1`,
];

export async function findMemberByUserId(userId: string): Promise<MemberRow> {
  if (!userId) {
    log.debug('findMemberByUserId: userId is empty');
    return null;
  }

  for (const sql of LOOKUP_QUERIES) {
    try {
      const rows = await q<Record<string, any>>(sql, [userId]);
      if (rows[0]) {
        log.debug('findMemberByUserId: Found member with query:', sql);
        return rows[0];
      }
    } catch (error) {
      log.debug('findMemberByUserId: Query failed:', sql, error instanceof Error ? error.message : error);
      // ignore column errors and continue to next strategy
    }
  }

  log.debug('findMemberByUserId: No member found for userId:', userId);
  return null;
}
