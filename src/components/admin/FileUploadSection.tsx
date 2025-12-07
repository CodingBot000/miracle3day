'use client';

import React, {
  ChangeEvent,
  MouseEvent,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import Image from 'next/image';
import {
  XCircleIcon,
  Upload,
  Image as ImageIcon,
  Trash2,
  Download,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { downloadFileFromS3 } from '@/utils/downloadFile';
import { log } from '@/utils/logger';

type FileType = 'image' | 'excel' | 'pdf';

interface FileUploadSectionProps {
  onFileChange: (files: File[]) => void;
  name: string;
  title: string;
  description: string;
  fileType: FileType;
  maxFiles?: number;
  initialFiles?: string[];
  existingFileNames?: string[];
  existingFileKeys?: string[]; // S3 파일 키 (다운로드용)
  onExistingDataChange?: (data: any) => void;
  onDeletedFileChange?: (deletedUrl: string | null) => void;
  onCurrentFileChange?: (currentUrl: string | null) => void;
  onClearAllFiles?: () => Promise<void>;
}

const FileUploadSection = ({
  onFileChange,
  name,
  title,
  description,
  fileType,
  maxFiles = 1,
  initialFiles = [],
  existingFileNames = [],
  existingFileKeys = [],
  onExistingDataChange,
  onDeletedFileChange,
  onCurrentFileChange,
  onClearAllFiles,
}: FileUploadSectionProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [isExistingFiles, setIsExistingFiles] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 삭제된 파일 URL 추적
  const [deletedFileUrl, setDeletedFileUrl] = useState<string | null>(null);

  // 삭제된 파일 URL 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    
    if (onDeletedFileChange) {
      onDeletedFileChange(deletedFileUrl);
    }
  }, [deletedFileUrl, onDeletedFileChange]);

  // 초기 파일 설정 및 변경 감지
  useEffect(() => {
    // initialFiles가 실제로 변경되었을 때만 처리
    if (initialFiles.length > 0) {
      log.info(
        'FileUploadSection 파일 설정:',
        initialFiles,
      );
      setIsExistingFiles(true);
      setFileNames(initialFiles.map(file => file.split('/').pop() || '기존 파일'));
      // 초기 파일이 있을 때는 부모에게 알리지 않음 (기존 파일이므로)
    }
    // initialFiles가 빈 배열인 경우는 초기 상태와 동일하므로 아무것도 하지 않음
  }, [JSON.stringify(initialFiles)]);

  // 파일 타입별 accept 설정
  const getAcceptConfig = () => {
    switch (fileType) {
      case 'image':
        return {
          'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
        };
      case 'excel':
        return {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          'application/vnd.ms-excel': ['.xls', '.csv', '.xlsx'],
        };
      case 'pdf':
        return {
          'application/pdf': ['.pdf'],
        };
      default:
        return {};
    }
  };

  // 파일 처리 함수
  const processFiles = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // 에러 메시지 초기화
      setErrorMessage(null);

      log.info(`processFiles - acceptedFiles: ${acceptedFiles.length}, rejectedFiles: ${rejectedFiles.length}`);

      // 파일명 검증 (한글, 공백 체크)
      for (const file of acceptedFiles) {
        const containsKorean = /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(file.name);
        const containsSpace = /\s/.test(file.name);
        
        if (containsKorean || containsSpace) {
          setErrorMessage('파일명에 한글 혹은 공백이 있으면 모두 제거하고 올려주세요.');
          return;
        }
      }

      setFiles(prevFiles => {
        // 1. 최대 파일 개수 체크 (가장 먼저)
        log.info(`개수 체크 prevFiles.length: ${prevFiles.length}   acceptedFiles.length: ${acceptedFiles.length} > max:${maxFiles}`);
        
        if (prevFiles.length + acceptedFiles.length > maxFiles) {
          setErrorMessage(`최대 ${maxFiles}개까지 업로드 가능합니다.`);
          return prevFiles;
        }

        // 2. 파일 형식 체크 (개수 체크 통과 후)
        if (rejectedFiles.length > 0) {
          setErrorMessage('지원하지 않는 파일 형식입니다. 올바른 파일을 선택해주세요.');
          return prevFiles;
        }

        // 3. 모든 검증 통과 - 파일 추가
        const newFiles = [...prevFiles, ...acceptedFiles];
        
        setFileNames(prevFileNames => {
          const newFileNames = [...prevFileNames, ...acceptedFiles.map(file => file.name)];
          return newFileNames;
        });
        
        onFileChange(newFiles); // 새 파일들 선택 시 부모에게 알림
        setIsExistingFiles(false);
        
        return newFiles;
      });
    },
    [onFileChange, maxFiles],
  );

  // dropzone 설정
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isDragAccept,
  } = useDropzone({
    onDrop: processFiles,
    accept: getAcceptConfig() as any,
    // maxFiles 설정 제거 - 우리가 직접 제어
  });

  // 파일 삭제
  const handleDeleteFile = (index: number) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setFiles(prevFiles => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      
      setFileNames(prevFileNames => {
        const newFileNames = prevFileNames.filter((_, i) => i !== index);
        return newFileNames;
      });
      
      onFileChange(newFiles);
      
      return newFiles;
    });
    
    // existingData 수정 부분 제거 - 원본 데이터는 그대로 유지
  };


  const handleClearAll = async () => {
    log.info('handleClearAll : ', onClearAllFiles);
    try {
      // 실제 파일 삭제 수행
      if (onClearAllFiles) {
        await onClearAllFiles();
      }

      // 로컬 상태 초기화
      setFiles([]);
      setFileNames([]);
      onFileChange([]);
      setIsExistingFiles(false);
    } catch (error) {
      console.error('전체 삭제 중 오류:', error);
    }
  };

  // 파일 다운로드 핸들러
  const handleDownload = async () => {
    try {
      if (existingFileKeys.length === 0) {
        console.warn('다운로드할 파일이 없습니다.');
        return;
      }

      log.info('파일 다운로드 시작:', existingFileKeys);

      // 각 파일을 순차적으로 다운로드
      for (let i = 0; i < existingFileKeys.length; i++) {
        const fileKey = existingFileKeys[i];
        const fileName = existingFileNames[i] || fileKey.split('/').pop() || 'download';

        await downloadFileFromS3(fileKey, fileName);

        // 브라우저 다운로드 제한 방지를 위한 지연
        if (i < existingFileKeys.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      log.info('파일 다운로드 완료');
    } catch (error) {
      console.error('파일 다운로드 중 오류:', error);
      setErrorMessage('파일 다운로드에 실패했습니다.');
    }
  };

  // dropzone 스타일
  const getDropzoneStyle = () => {
    let baseStyle =
      'border-2 border-dashed transition-colors duration-200 ease-in-out ';

    if (isDragAccept) {
      baseStyle += 'border-green-400 bg-green-50 ';
    } else if (isDragReject) {
      baseStyle += 'border-red-400 bg-red-50 ';
    } else if (isDragActive) {
      baseStyle += 'border-blue-400 bg-blue-50 ';
    } else {
      baseStyle +=
        'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 ';
    }

    baseStyle += 'cursor-pointer ';
   
    return baseStyle;
  };

  return (
    <div className='w-full'>
      <div className='flex justify-between items-start my-4'>
        <div>
          <h2 className='font-semibold text-lg mb-2'>
            {title}
          </h2>
          {description && (
            <div className='text-sm text-gray-600 whitespace-pre-line'>
              {description}
            </div>
          )}
        </div>
      </div>

      {/* 에러 메시지 표시 */}
      {errorMessage && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-sm text-red-600'>{errorMessage}</p>
        </div>
      )}

      {/* 파일 개수 표시 */}
      <div className='mb-2 text-sm text-gray-600'>
        {existingFileNames.length > 0 
          ? `기존 파일: ${existingFileNames.length} / ${maxFiles}개`
          : `업로드 예정 파일: ${files.length} / ${maxFiles}`
        }
      </div>
      {existingFileNames.length > 0 && (
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={handleClearAll}
            className='text-sm bg-red-400 text-white border rounded px-3 py-1 hover:bg-red-500 transition-colors'
          >
            전체 삭제
          </button>
          <button
            type='button'
            onClick={handleDownload}
            className='text-sm bg-blue-500 text-white border rounded px-3 py-1 hover:bg-blue-600 transition-colors flex items-center gap-1'
          >
            <Download size={16} />
            파일 다운로드
          </button>
        </div>
      )}
      {/* 기존 파일 목록 표시 */}
      {existingFileNames.length > 0 && (
        <div className='mb-4'>
          <h4 className='text-sm font-medium text-gray-700 mb-2'>기존 파일:</h4>
          <div className='space-y-2'>
            {existingFileNames.map((fileName, index) => (
              <div key={index} className='flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                {/* <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                  {fileType === 'excel' && <span className='text-blue-600 text-xs font-bold'>X</span>}
                  {fileType === 'pdf' && <span className='text-red-600 text-xs font-bold'>P</span>}
                  {fileType === 'image' && <span className='text-green-600 text-xs font-bold'>I</span>}
                </div> */}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {fileName}
                  </p>
                  <p className='text-xs text-blue-600'>
                    기존 파일
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 파일 목록 */}
      {files.length > 0 && (
        <div className='mb-4 space-y-2'>
          {files.map((file, index) => (
            <div key={index} className='flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg'>
              <div className='flex items-center space-x-3'>
                {/* <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
                  {fileType === 'excel' && <span className='text-blue-600 text-xs font-bold'>X</span>}
                  {fileType === 'pdf' && <span className='text-red-600 text-xs font-bold'>P</span>}
                  {fileType === 'image' && <span className='text-green-600 text-xs font-bold'>I</span>}
                </div> */}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {fileNames[index]}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {fileType === 'excel' ? 'Excel 파일' : fileType === 'pdf' ? 'PDF 파일' : '이미지 파일'}
                  </p>
                </div>
              </div>
              <button
                type='button'
                onClick={handleDeleteFile(index)}
                className='
                  flex items-center justify-center
                  w-6 h-6 
                  bg-red-500 hover:bg-red-600 
                  text-white rounded-full
                  transition-colors duration-200
                  shadow-md hover:shadow-lg
                  transform hover:scale-105
                '
                title='파일 삭제'
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 드롭존 - 파일이 최대 개수보다 적을 때만 표시 */}
      {(existingFileNames.length === 0 && files.length < maxFiles) && (
        <div
          {...getRootProps()}
          className={`${getDropzoneStyle()} rounded-lg w-full h-16 flex items-center justify-center text-center`}
        >
          <input {...getInputProps()} />
          <div className='flex items-center space-x-2'>
            {isDragActive ? (
              <>
                <Upload className='w-5 h-5 text-blue-500' />
                <p className='text-sm font-medium text-blue-600'>
                  {isDragAccept
                    ? '파일을 여기에 놓으세요!'
                    : '지원하지 않는 파일입니다'}
                </p>
              </>
            ) : (
              <>
                <Upload className='w-5 h-5 text-gray-400' />
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    {fileType === 'excel' ? 'Excel 파일 업로드' : 
                     fileType === 'pdf' ? 'PDF 파일 업로드' : '이미지 업로드'}
                  </p>
                  <p className='text-xs text-gray-500'>
                    클릭 또는 드래그 (최대 {maxFiles}개)
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
