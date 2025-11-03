/**
 * Determine if cached data is stale and needs refresh
 */

interface StalenessCheckInput {
  lastSyncedAt: Date | string | null;
  syncCadenceHours: number;
}

/**
 * Check if data is stale based on last sync time and cadence
 * @param lastSyncedAt - Last time data was synced
 * @param syncCadenceHours - Hours between syncs (default 72 = 3 days)
 * @returns true if data needs refresh, false if cache is still fresh
 */
export function isStale({ lastSyncedAt, syncCadenceHours }: StalenessCheckInput): boolean {
  // If never synced, it's stale
  if (!lastSyncedAt) {
    return true;
  }

  const lastSync = typeof lastSyncedAt === 'string' ? new Date(lastSyncedAt) : lastSyncedAt;
  const now = new Date();
  const diffMs = now.getTime() - lastSync.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours >= syncCadenceHours;
}

/**
 * Calculate next sync time
 */
export function getNextSyncTime(lastSyncedAt: Date | string | null, syncCadenceHours: number): Date | null {
  if (!lastSyncedAt) {
    return new Date(); // Sync now
  }

  const lastSync = typeof lastSyncedAt === 'string' ? new Date(lastSyncedAt) : lastSyncedAt;
  return new Date(lastSync.getTime() + syncCadenceHours * 60 * 60 * 1000);
}
