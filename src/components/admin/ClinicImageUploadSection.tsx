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
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import ImageOrderModal from './ImageOrderModal';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableImageItem from './SortableImageItem';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFormMode } from '@/contexts/admin/FormModeContext';
import { log } from '@/utils/logger';

interface ClinicImageUploadSectionProps {
  onFilesChange: (files: File[]) => void;
  name: string;
  type: 'Avatar' | 'Banner';
  maxImages: number;
  title: string;
  description: string;
  initialImages?: string[];
  onExistingDataChange?: (data: any) => void;
  onDeletedImagesChange?: (deletedUrls: string[]) => void;
  onCurrentImagesChange?: (currentUrls: string[]) => void;
  onUserChanged?: (kind: 'gallery:add' | 'gallery:replace' | 'gallery:remove' | 'gallery:reorder') => void;
}

/**
 * TODO: Avatar (의사이미지) 관련 코드 삭제해야함. 사용하지않음. 다른파일 에서 별도관리함))
 */
const DEFAULT_IMAGES = [
  {
    label: '디폴트 남자',
    src: '/admin/default/doctor_default_man.png',
    key: 'man',
  },
  {
    label: '디폴트 여자',
    src: '/admin/default/doctor_default_woman.png',
    key: 'woman',
  },
];

const ClinicImageUploadSection = ({
  onFilesChange,
  name,
  type,
  maxImages,
  title,
  description,
  initialImages = [],
  onExistingDataChange,
  onDeletedImagesChange,
  onCurrentImagesChange,
  onUserChanged,
}: ClinicImageUploadSectionProps) => {
  const { isReadMode } = useFormMode();
  const [preview, setPreview] = useState<
    Array<string | undefined>
  >([]);
  const [files, setFiles] = useState<Array<File>>([]);
  const [isExistingImage, setIsExistingImage] = useState<
    boolean[]
  >([]);
  // 삭제된 이미지 URL 추적
  const [deletedImageUrls, setDeletedImageUrls] = useState<string[]>([]);
  
  // 파일 개수 초과 경고 메시지 상태
  const [overLimitWarning, setOverLimitWarning] =
    useState<string>('');

  // Avatar용 default 이미지 체크 상태
  const [defaultChecked, setDefaultChecked] = useState<{
    man: boolean;
    woman: boolean;
  }>({
    man: false,
    woman: false,
  });

  // Avatar 타입은 추가 버튼을 통해 동적으로 업로드 영역 추가
  const [avatarCount, setAvatarCount] = useState(1);

  // default 이미지 체크 시 업로드/추가 버튼 비활성화
  const disableUpload =
    type === 'Avatar' &&
    (defaultChecked.man || defaultChecked.woman);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [images, setImages] = useState<string[]>(initialImages);

  useEffect(() => {
    onFilesChange(files);
  }, [files, onFilesChange]);

  // 삭제된 이미지 URL 변경 시 부모 컴포넌트에 알림
  useEffect(() => {
    if (onDeletedImagesChange) {
      onDeletedImagesChange(deletedImageUrls);
    }
  }, [deletedImageUrls, onDeletedImagesChange]);

  // 현재 표시된 이미지 URL들 변경 시 부모 컴포넌트에 알림 
  // onCurrentImagesChange에서 URL만 필터링 후 전달
  useEffect(() => {
    if (onCurrentImagesChange) {
      const currentUrls = preview.filter((url): url is string => 
        typeof url === 'string' && url.startsWith('http')
      );
      onCurrentImagesChange(currentUrls);
    }
  }, [preview, onCurrentImagesChange]);

  // 초기 이미지 설정
  useEffect(() => {
    if (initialImages.length > 0 && preview.length === 0) {
      log.info(
        'ClinicImageUploadSection 초기 이미지 설정:',
        initialImages,
      );
      setPreview(initialImages);
      setIsExistingImage(
        new Array(initialImages.length).fill(true),
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImages]);

  // 파일 처리 함수
  const processFiles = useCallback(
    (acceptedFiles: File[]) => {
      if (disableUpload) return;

      // Banner는 maxImages(7개) 제한, Avatar는 개수 제한 없음
      const currentCount = preview.length;
      const newFilesCount = acceptedFiles.length;
      const totalCount = currentCount + newFilesCount;

      // Banner 타입에서 개수 제한 체크
      if (type === 'Banner') {
        if (totalCount > maxImages) {
          const exceeded = totalCount - maxImages;
          setOverLimitWarning(
            `최대 ${maxImages}개까지만 업로드 가능합니다. ${exceeded}개 파일이 제외되었습니다.`,
          );

          // 허용된 개수만큼만 처리
          const allowedCount = Math.max(
            0,
            maxImages - currentCount,
          );
          const fileList = acceptedFiles.slice(
            0,
            allowedCount,
          );

          if (fileList.length > 0) {
            setFiles((prev) => [...prev, ...fileList]);

            fileList.forEach((file) => {
              const fileReader = new FileReader();
              fileReader.onload = () => {
                const result = fileReader.result as string;
                setPreview((prev) => prev.concat(result));
                setIsExistingImage((prev) =>
                  prev.concat(false),
                );
              };
              // 새로 추가한 이미지는 base64 데이터로 생성 
              fileReader.readAsDataURL(file);
            });
          }
          return;
        } else {
          // 7개 이하면 경고메시지 제거
          setOverLimitWarning('');
        }
      }

      const fileList = acceptedFiles;

      if (fileList.length === 0) return;

      setFiles((prev) => [...prev, ...fileList]);

      fileList.forEach((file) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const result = fileReader.result as string;
          setPreview((prev) => prev.concat(result));
          setIsExistingImage((prev) => prev.concat(false));
        };
        // 새로 추가한 이미지는 base64 데이터로 생성
        fileReader.readAsDataURL(file);
      });

      // Dirty Flag: 갤러리 파일 추가
      onUserChanged?.('gallery:add');

      // Avatar의 경우 슬롯 수 증가
      if (type === 'Avatar') {
        setAvatarCount((prev) => prev + fileList.length);
      }
    },
    [disableUpload, type, maxImages, preview.length, onUserChanged],
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
    disabled: disableUpload || isReadMode, // ✅ Read Mode에서 비활성화
    // maxFiles 제한을 제거하여 processFiles에서 직접 처리
  });

  // 미리보기/파일 삭제
  const handleDeletePreview = (
    e: MouseEvent<HTMLButtonElement>,
    i: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // 기존 이미지가 삭제되는 경우 URL 추적
    if (isExistingImage[i] && preview[i]) {
      setDeletedImageUrls(prev => [...prev, preview[i] as string]);
      log.info('기존 이미지 삭제됨:', preview[i]);
    }

    // Dirty Flag: 갤러리 삭제
    onUserChanged?.('gallery:remove');

    setPreview((prev) =>
      prev.filter((_, idx) => i !== idx),
    );
    setFiles((prev) => prev.filter((_, idx) => i !== idx));
    setIsExistingImage((prev) =>
      prev.filter((_, idx) => i !== idx),
    );

    if (type === 'Avatar') {
      setAvatarCount((c) => Math.max(1, c - 1));
    }

    // 삭제 후 7개 이하가 되면 경고메시지 제거
    if (
      type === 'Banner' &&
      preview.length - 1 <= maxImages
    ) {
      setOverLimitWarning('');
    }
  };

  // 전체 삭제 함수
  const handleClearAll = () => {
    // 기존 이미지들이 모두 삭제되는 경우 URL 추적
    const existingImageUrls = preview
      .filter((_, idx) => isExistingImage[idx])
      .filter((url): url is string => typeof url === 'string');
    if (existingImageUrls.length > 0) {
      setDeletedImageUrls(prev => [...prev, ...existingImageUrls]);
      log.info('전체 삭제 - 기존 이미지들:', existingImageUrls);
    }

    // Dirty Flag: 갤러리 전체 삭제
    onUserChanged?.('gallery:remove');

    setPreview([]);
    setFiles([]);
    setIsExistingImage([]);
    setOverLimitWarning('');
    onFilesChange([]);
    
    // existingData의 이미지 URL 클리어
    if (onExistingDataChange) {
      onExistingDataChange((prevData: any) => {
        if (!prevData || !prevData.hospital) {
          return prevData; // 또는 { hospital: { imageurls: [] } } 등 원하는 기본값
        }
        return {
          ...prevData,
          hospital: {
            ...prevData.hospital,
            imageurls: []
          }
        };
      });
    }
    if (type === 'Avatar') {
      setAvatarCount(1);
    }

    // default 이미지 체크도 해제
    if (type === 'Avatar') {
      setDefaultChecked({ man: false, woman: false });
    }
  };

  // Avatar에서 추가 버튼
  const handleAddAvatar = () => {
    if (disableUpload) return;
    setAvatarCount((c) => c + 1);
  };

  // Default 이미지 체크박스 핸들러
  const handleDefaultChange =
    (key: 'man' | 'woman') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setDefaultChecked((prev) => ({
        ...prev,
        [key]: checked,
      }));

      if (checked) {
        // 선택시 미리보기/파일/슬롯 모두 리셋
        setPreview([
          DEFAULT_IMAGES.find((img) => img.key === key)!
            .src,
        ]);
        setFiles([]);
        setAvatarCount(1);
        setOverLimitWarning(''); // 경고메시지도 제거
      } else {
        // 체크 해제시 모두 리셋
        setPreview([]);
        setFiles([]);
        setAvatarCount(1);
        setOverLimitWarning(''); // 경고메시지도 제거
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

    if (disableUpload) {
      baseStyle += 'opacity-50 cursor-not-allowed ';
    } else {
      baseStyle += 'cursor-pointer ';
    }

    return baseStyle;
  };

  // Banner는 grid, Avatar는 flex
  const containerClass =
    type === 'Banner'
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
      : 'flex flex-row gap-4 flex-wrap';

  // 현재 슬롯 수 계산
  const slots = type === 'Avatar' ? avatarCount : maxImages;
  const canAddMore =
    type === 'Banner' ? preview.length < maxImages : true;

  // 순서변경 완료 핸들러  순서 변경 시 base64 포함 배열 그대로 유지
  const handleOrderModalComplete = (newOrder: string[]) => {
    setPreview(newOrder);
    setIsOrderModalOpen(false);

    // Dirty Flag: 갤러리 순서변경
    onUserChanged?.('gallery:reorder');
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
          {/* 순서변경 버튼 */}
          <span className="text-xs">
            <button
              className="mt-2 px-3 py-1 border rounded text-sm text-black bg-orange-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setIsOrderModalOpen(true)}
              disabled={isReadMode}
            >
              순서변경
            </button>

            <span className="ml-2 text-red-500 font-bold">
              순서변경 혹은 이미지 추가 후 반드시 하단에 &apos;save and next&apos; 버튼을 눌러야 반영됩니다.
            </span>
          </span>

        </div>
        <div className='flex flex-col items-end gap-2'>
          {type === 'Banner' && (
            <p className='text-sm text-gray-600'>
              등록 {preview.length}/{maxImages}
            </p>
          )}
          {type === 'Avatar' && (
            <p className='text-sm text-gray-600'>
              등록 {preview.length}
            </p>
          )}
          {/* 전체 삭제 버튼 - 파일이 있을 때만 표시 */}
          {preview.length > 0 && (
            <button
              type='button'
              onClick={handleClearAll}
              className='text-sm bg-red-400 text-white border rounded px-3 py-1 hover:bg-white-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={isReadMode}
            >
              전체 삭제
            </button>
          )}
        </div>
      </div>

      {/* 파일 개수 초과 경고 메시지 - 상단에 배치 */}
      {overLimitWarning && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-sm text-red-600 font-medium'>
            ⚠️ {overLimitWarning}
          </p>
        </div>
      )}

      {/* Avatar 타입일 때만 default 체크박스 + 이미지 */}
      {type === 'Avatar' && (
        <div className='flex flex-row items-center gap-6 mb-4'>
          {DEFAULT_IMAGES.map((img) => (
            <label
              key={img.key}
              className='flex items-center gap-2 cursor-pointer'
            >
              <input
                type='checkbox'
                checked={
                  defaultChecked[img.key as 'man' | 'woman']
                }
                onChange={handleDefaultChange(
                  img.key as 'man' | 'woman',
                )}
                disabled={
                  disableUpload &&
                  !defaultChecked[
                    img.key as 'man' | 'woman'
                  ]
                }
                className='w-4 h-4'
              />
              <Image
                src={img.src}
                alt={img.label}
                width={36}
                height={36}
                className='rounded-full border-2 border-gray-200'
              />
              <span className='text-sm text-gray-700'>
                {img.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Dropzone 영역 */}
      {canAddMore && !disableUpload && !isReadMode && (
        <div
          {...getRootProps()}
          className={`${getDropzoneStyle()} rounded-lg p-8 mb-4 text-center`}
        >
          <input {...getInputProps()} />
          <div className='flex flex-col items-center justify-center space-y-3'>
            {isDragActive ? (
              <>
                <Upload className='w-12 h-12 text-blue-500' />
                <p className='text-lg font-medium text-blue-600'>
                  {isDragAccept
                    ? '파일을 여기에 놓으세요!'
                    : '지원하지 않는 파일입니다'}
                </p>
              </>
            ) : (
              <>
                <ImageIcon className='w-12 h-12 text-gray-400' />
                <div className='space-y-1'>
                  <p className='text-lg font-medium text-gray-600'>
                    이미지를 드래그하거나 클릭하여 업로드
                  </p>
                  <p className='text-sm text-gray-500'>
                    JPEG, PNG, GIF, WebP 형식 지원
                    {type === 'Banner' &&
                      ` (최대 ${maxImages}개)`}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 미리보기 영역 */}
      {preview.length > 0 && (
        <div className={containerClass}>
          {preview.map((src, i) => (
            <div
              key={i}
              className={`
                relative group
                ${
                  type === 'Avatar'
                    ? 'w-[120px] h-[120px] rounded-full'
                    : 'w-full aspect-[16/9] rounded-lg'
                } 
                overflow-hidden bg-gray-100 border-2 border-gray-200
              `}
            >
              {src && (
                <>
                  <Image
                    src={src}
                    alt={`preview-${i}`}
                    fill={type === 'Banner'}
                    width={
                      type === 'Avatar' ? 120 : undefined
                    }
                    height={
                      type === 'Avatar' ? 120 : undefined
                    }
                    className={`object-cover ${type === 'Avatar' ? 'rounded-full' : 'rounded-lg'}`}
                  />

                  {/* 삭제 버튼 - default 이미지가 아닐 때만 표시 */}
                  {/* {!(
                    defaultChecked.man ||
                    defaultChecked.woman
                  ) && (
                    <button
                      type='button'
                      onClick={(e) =>
                        handleDeletePreview(e, i)
                      }
                      className='
                        absolute top-2 right-2 
                        bg-red-500 text-white rounded-full p-1
                        hover:bg-red-600 hover:scale-110
                        transform transition-all duration-200
                        shadow-lg border-2 border-white
                        z-10
                      '
                      title='이미지 삭제'
                    >
                      <XCircleIcon
                        size={18}
                        className='text-white'
                        strokeWidth={2}
                      />
                    </button>
                  )} */}
                </>
              )}
            </div>
          ))}

          {/* Avatar일 때만 추가 버튼 */}
          {type === 'Avatar' && !disableUpload && !isReadMode && (
            <button
              type='button'
              onClick={handleAddAvatar}
              className='
                w-[120px] h-[120px]
                border-2 border-dashed border-gray-300
                flex flex-col items-center justify-center
                rounded-full text-gray-400
                hover:border-blue-500 hover:text-blue-500
                hover:bg-blue-50
                transition-all duration-200
              '
            >
              <Upload className='w-8 h-8 mb-2' />
              <span className='text-sm font-medium'>
                추가
              </span>
            </button>
          )}
        </div>
      )}

      {/* Banner에서 최대 개수 도달 시 안내 */}
      {type === 'Banner' && preview.length >= maxImages && (
        <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
          <p className='text-sm text-blue-700'>
            최대 {maxImages}개의 이미지를 업로드했습니다.
          </p>
        </div>
      )}

      {/* Default 이미지 선택 시 안내 */}
      {disableUpload && (
        <div className='mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg'>
          <p className='text-sm text-gray-600'>
            기본 이미지가 선택되어 있습니다. 커스텀 이미지를
            업로드하려면 기본 이미지 선택을 해제하세요.
          </p>
        </div>
      )}

      {isOrderModalOpen && (
        <ImageOrderModal
          images={preview.filter((url): url is string => typeof url === 'string')}
          onCancel={() => setIsOrderModalOpen(false)}
          onComplete={handleOrderModalComplete}
        />
      )}
    </div>
  );
};

export default ClinicImageUploadSection;
