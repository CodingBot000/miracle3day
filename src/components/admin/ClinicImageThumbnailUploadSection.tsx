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
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { log } from '@/utils/logger';

interface ClinicImageThumbnailUploadSectionProps {
  onFileChange: (file: File | string | null) => void;
  name: string;
  title: string;
  description: string;
  initialImage?: string | null;
  onExistingDataChange?: (data: any) => void;
  onDeletedImageChange?: (deletedUrl: string | null) => void;
  onCurrentImageChange?: (currentUrl: string | null) => void;
  onUserChanged?: (kind: 'thumbnail:replace' | 'thumbnail:delete') => void;
}

const ClinicImageThumbnailUploadSection = ({
  onFileChange,
  name,
  title,
  description,
  initialImage,
  onExistingDataChange,
  onDeletedImageChange,
  onCurrentImageChange,
  onUserChanged,
}: ClinicImageThumbnailUploadSectionProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isExistingImage, setIsExistingImage] = useState<boolean>(false);
  // 삭제된 이미지 URL 추적
  const [deletedImageUrl, setDeletedImageUrl] = useState<string | null>(null);

  // 삭제된 이미지 URL 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    if (onDeletedImageChange) {
      onDeletedImageChange(deletedImageUrl);
    }
  }, [deletedImageUrl, onDeletedImageChange]);

  // 현재 표시된 이미지 URL 변경 시 부모 컴포넌트에 알림 
  useEffect(() => {
    if (onCurrentImageChange) {
      const currentUrl = preview && preview.startsWith('http') ? preview : null;
      onCurrentImageChange(currentUrl);
    }
  }, [preview, onCurrentImageChange]);

  // 초기 이미지 설정 및 변경 감지
  useEffect(() => {
    if (initialImage) {
      log.info(
        'ClinicImageThumbnailUploadSection 이미지 설정:',
        initialImage,
      );
      setPreview(initialImage);
      setIsExistingImage(true);
      onFileChange(initialImage); // 초기 이미지가 있을 때 부모에게 알림
    } else {
      // initialImage가 null인 경우 (삭제된 경우)
      setPreview(null);
      setFile(null);
      setIsExistingImage(false);
    }
  }, [initialImage, onFileChange]);

  // 파일 처리 함수
  const processFiles = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0]; // 첫 번째 파일만 사용
      if (!selectedFile) return;

      setFile(selectedFile);
      onFileChange(selectedFile); // 새 파일 선택 시 부모에게 알림

      // Dirty Flag: 썸네일 교체
      onUserChanged?.('thumbnail:replace');

      const fileReader = new FileReader();
      fileReader.onload = () => {
        const result = fileReader.result as string;
        setPreview(result);
        setIsExistingImage(false);
      };
      // 새로 추가한 이미지는 base64 데이터로 생성
      fileReader.readAsDataURL(selectedFile);
    },
    [onFileChange, onUserChanged],
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
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
  });

  // 이미지 삭제
  const handleDeleteImage = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // 기존 이미지가 삭제되는 경우 URL 추적
    if (isExistingImage && preview) {
      setDeletedImageUrl(preview);
      log.info('기존 이미지 삭제됨:', preview);
    }

    // Dirty Flag: 썸네일 삭제
    onUserChanged?.('thumbnail:delete');

    setPreview(null);
    setFile(null);
    setIsExistingImage(false);
    onFileChange(null);

    // existingData 수정 부분 제거 - 원본 데이터는 그대로 유지
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

      {/* 이미지 영역과 삭제 버튼을 나란히 배치 */}
      <div className='flex items-start gap-4'>
        {/* 이미지 영역 */}
        <div className='flex-shrink-0'>
          {preview ? (
            /* 이미지가 있는 경우 */
            <div className='relative w-[150px] h-[150px] overflow-hidden bg-gray-100 border-2 border-gray-200 rounded-lg'>
              <Image
                src={preview}
                alt='thumbnail preview'
                width={150}
                height={150}
                className='object-cover rounded-lg'
              />
            </div>
          ) : (
            /* 이미지가 없는 경우 드롭존 표시 */
            <div
              {...getRootProps()}
              className={`${getDropzoneStyle()} rounded-lg w-[150px] h-[150px] flex items-center justify-center text-center`}
            >
              <input {...getInputProps()} />
              <div className='flex flex-col items-center justify-center space-y-1'>
                {isDragActive ? (
                  <>
                    <Upload className='w-6 h-6 text-blue-500' />
                    <p className='text-xs font-medium text-blue-600'>
                      {isDragAccept
                        ? '파일을 여기에 놓으세요!'
                        : '지원하지 않는 파일입니다'}
                    </p>
                  </>
                ) : (
                  <>
                    <ImageIcon className='w-6 h-6 text-gray-400' />
                    <div className='space-y-1'>
                      <p className='text-xs font-medium text-gray-600'>
                        이미지 업로드
                      </p>
                      <p className='text-xs text-gray-500'>
                        클릭 또는 드래그
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 삭제 버튼 - 이미지가 있을 때만 표시 */}
        {preview && (
          <span>
          <button
            type='button'
            onClick={handleDeleteImage}
            className='
              flex items-center justify-center
              w-8 h-8 
              bg-red-500 hover:bg-red-600 
              text-white rounded-full
              transition-colors duration-200
              shadow-md hover:shadow-lg
              transform hover:scale-105
            '
            title='이미지 삭제'
          >
            <Trash2 size={16} />
          </button>
          <h2 className='text-sm text-gray-600'>이미지를 교체하시려면 삭제 후 새로 업로드 해주세요.</h2>
          </span>
        )}
      </div>
    </div>
  );
};

export default ClinicImageThumbnailUploadSection;
