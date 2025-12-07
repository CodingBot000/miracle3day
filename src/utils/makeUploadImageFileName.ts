import { getTimestamp } from "./address/getTimeStamp";

/**
 * 파일명 생성 유틸
 * @param {string} id_uuid   - 병원 UUID
 * @param {string} name      - 병원 이름
 * @param {string} originalName - 원본 파일명 (확장자 포함)
 * @returns {string}          - 새 파일명
 */
export function makeUploadImageFileName(id_uuid: string, name: string, originalName: string) {
    const timestamp = getTimestamp();
    const fileExt = originalName.split('.').pop();
    const safeName = name.replace(/[^a-zA-Z0-9_]/g, '');
    return `${id_uuid}_${safeName}_${timestamp}.${fileExt}`;
  }