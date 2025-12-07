import { log } from "@/utils/logger";
/**
 * S3 파일 다운로드 유틸리티
 *
 * S3에서 파일을 다운로드하고 브라우저에서 저장하는 기능을 제공합니다.
 */

/**
 * S3에서 파일을 다운로드
 * @param fileKey - S3 객체 키 (파일 경로)
 * @param fileName - 저장할 파일명
 */
export async function downloadFileFromS3(fileKey: string, fileName: string): Promise<void> {
  try {
    log.info('파일 다운로드 시작:', { fileKey, fileName });

    // S3 파일 다운로드 API 호출
    const response = await fetch('/api/admin/storage/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: fileKey }),
    });

    if (!response.ok) {
      throw new Error(`파일 다운로드 실패: ${response.statusText}`);
    }

    // Blob으로 변환
    const blob = await response.blob();

    // 다운로드 링크 생성 및 클릭
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // 정리
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    log.info('파일 다운로드 완료:', fileName);
  } catch (error) {
    console.error('파일 다운로드 중 오류:', error);
    throw error;
  }
}

/**
 * 여러 파일을 순차적으로 다운로드
 * @param files - 다운로드할 파일 목록 [{key: string, name: string}]
 */
export async function downloadMultipleFiles(
  files: Array<{ key: string; name: string }>
): Promise<void> {
  for (const file of files) {
    try {
      await downloadFileFromS3(file.key, file.name);
      // 브라우저의 다운로드 제한을 피하기 위해 약간의 지연
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`파일 다운로드 실패: ${file.name}`, error);
      // 계속 진행
    }
  }
}
