/**
 * 병원 UUID에 따른 treatments 엑셀 파일 경로를 반환합니다.
 * @param id_uuid_hospital 병원 UUID
 * @param fileName 선택적으로 파일명을 지정하면 파일 경로까지 포함
 * @returns 파일 또는 폴더 경로 문자열
 */
export const getTreatmentsFilePath = (
  id_uuid_hospital: string,
  fileName?: string
): string => {
  const basePath = `files/${id_uuid_hospital}/treatments/`;
  return fileName ? `${basePath}${fileName}` : basePath;
};