/**
 * Convert UUID to short ID (8 characters)
 * Removes dashes and takes first 8 characters
 *
 * Example: "550e8400-e29b-41d4-a716-446655440000" -> "550e8400"
 */
export function toShortId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8);
}

/**
 * Generate Stream Chat channel ID from hospital and user UUIDs
 * Format: h{shortHospitalId}_u{shortUserId}
 *
 * Example: h550e8400_u446655440
 */
export function generateChannelId(hospitalId: string, userId: string): string {
  const shortHospital = toShortId(hospitalId);
  const shortUser = toShortId(userId);
  return `h${shortHospital}_u${shortUser}`;
}
