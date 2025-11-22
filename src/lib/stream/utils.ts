/**
 * UUID를 짧은 ID로 변환
 * UUID에서 하이픈을 제거하고 앞 8글자만 사용
 *
 * @param id - Full UUID (예: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6")
 * @returns Short ID (예: "a1b2c3d4")
 */
export function toShortId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8);
}

/**
 * 병원 ID와 사용자 ID로 짧은 채널 ID 생성
 *
 * @param hospitalId - Hospital UUID (id_uuid_hospital)
 * @param userId - User UUID (members.id_uuid)
 * @returns Channel ID (예: "h1a2b3c4_u9d8e7f6")
 */
export function createChannelId(hospitalId: string, userId: string): string {
  const shortHospital = toShortId(hospitalId);
  const shortUser = toShortId(userId);
  return `h${shortHospital}_u${shortUser}`;
}
