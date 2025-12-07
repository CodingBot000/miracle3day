'use client';

import React, {
  ChangeEvent,
  MouseEvent,
  useState,
  useEffect,
  useCallback,
} from 'react';
import Image from 'next/image';
import {
  XCircleIcon,
  Upload,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';

export interface DoctorInfo {
  id: string;
  name: string;
  name_en: string;
  bio: string;
  bio_en: string;
  imageFile?: File;
  imagePreview?: string;
  useDefaultImage: boolean;
  defaultImageType?: 'man' | 'woman';
  isChief: boolean;
  isExistingImage?: boolean;
  originalImageUrl?: string;
}

interface DoctorInfoFormProps {
  open: boolean;
  initialData?: DoctorInfo;
  onClose: () => void;
  onSave: (doctorInfo: DoctorInfo) => void;
  onUserChanged?: (kind: 'doctors:text' | 'doctors:photo') => void;
}

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

const DoctorInfoForm: React.FC<DoctorInfoFormProps> = ({
  open,
  initialData,
  onClose,
  onSave,
  onUserChanged,
}) => {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  
  const [bio, setBio] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(
    null,
  );
  const [imagePreview, setImagePreview] =
    useState<string>('');
  const [useDefaultImage, setUseDefaultImage] =
    useState(false);
  const [defaultImageType, setDefaultImageType] = useState<
    'man' | 'woman' | undefined
  >('man');
  const [isAnimating, setIsAnimating] = useState(false);

  // 초기 데이터 설정
  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      if (initialData) {
        setName(initialData.name);
        setNameEn(initialData.name_en);
        setBio(initialData.bio);
        setBioEn(initialData.bio_en);
        setImageFile(initialData.imageFile || null);
        setImagePreview(initialData.imagePreview || '');
        setUseDefaultImage(initialData.useDefaultImage);
        setDefaultImageType(
          initialData.defaultImageType || 'man',
        );
      } else {
        // 새로 생성시 초기화
        setName('');
        setNameEn('');
        setBio('');
        setBioEn('');
        setImageFile(null);
        setImagePreview('');
        setUseDefaultImage(false);
        setDefaultImageType(undefined);
      }
      // 스크롤 막기
      document.body.style.overflow = 'hidden';
    } else {
      // 스크롤 복원
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, initialData]);

  // 파일 처리 함수
  const processFiles = useCallback(
    (acceptedFiles: File[]) => {
      if (useDefaultImage) return;

      const file = acceptedFiles[0]; // 1장만 허용
      if (!file) return;

      setImageFile(file);

      // Dirty Flag: 의사 사진 변경
      onUserChanged?.('doctors:photo');

      const fileReader = new FileReader();
      fileReader.onload = () => {
        const result = fileReader.result as string;
        setImagePreview(result);
      };
      // 새로 추가한 이미지는 base64 데이터로 생성
      fileReader.readAsDataURL(file);
    },
    [useDefaultImage, onUserChanged],
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
    disabled: useDefaultImage,
    maxFiles: 1,
  });

  // 이미지 삭제
  const handleDeleteImage = (
    e: MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Dirty Flag: 의사 사진 삭제
    onUserChanged?.('doctors:photo');

    // 업로드된 이미지와 미리보기 제거
    setImageFile(null);
    setImagePreview('');

    // 디폴트 이미지 상태도 초기화 (체크박스 해제와 같은 상태)
    setUseDefaultImage(false);
    setDefaultImageType(undefined);
  };

  // 기본 이미지 선택
  const handleDefaultImageChange =
    (type: 'man' | 'woman') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;

      // Dirty Flag: 기본 이미지 선택
      if (checked) {
        onUserChanged?.('doctors:photo');
      }

      setUseDefaultImage(checked);
      setDefaultImageType(type);

      if (checked) {
        // 기본 이미지 선택시 업로드된 이미지 제거
        setImageFile(null);
        setImagePreview(
          DEFAULT_IMAGES.find((img) => img.key === type)!
            .src,
        );
      } else {
        // 기본 이미지 해제시 미리보기도 제거
        setImagePreview('');
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

    if (useDefaultImage) {
      baseStyle += 'opacity-50 cursor-not-allowed ';
    } else {
      baseStyle += 'cursor-pointer ';
    }

    return baseStyle;
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSave = () => {
    if (!name.trim() || !nameEn.trim())  {
      alert('이름을 입력해주세요. (영문포함)');
      return;
    }

    if (!bio.trim() || !bioEn.trim()) {
      alert('약력을 입력해주세요. (영문포함)');
      return;
    }

    if (!useDefaultImage && !imageFile && !imagePreview) {
      alert(
        '이미지를 업로드하거나 기본 이미지를 선택해주세요.',
      );
      return;
    }

    const doctorInfo: DoctorInfo = {
      id: initialData?.id || uuidv4(),
      name: name.trim(),
      name_en: nameEn.trim(),
      bio: bio, // trim() 제거하여 줄바꿈 보존
      bio_en: bioEn, // trim() 제거하여 줄바꿈 보존
      imageFile: useDefaultImage
        ? undefined
        : imageFile || undefined,
      imagePreview: imagePreview,
      useDefaultImage,
      defaultImageType: useDefaultImage
        ? defaultImageType
        : undefined,
      isChief: initialData?.isChief || false, // 기존 대표원장 상태 유지
      isExistingImage: initialData?.isExistingImage,
      originalImageUrl: initialData?.originalImageUrl,
    };

    onSave(doctorInfo);
    handleClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 배경 클릭시 닫히지 않도록 함
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-[9999]'>
      {/* 배경 오버레이 */}
      <div
        className='absolute inset-0 bg-black bg-opacity-50'
        onClick={handleBackdropClick}
      />

      {/* 모달 */}
      <div
      className={`
        absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
        bg-white rounded-2xl shadow-2xl
        transition-all duration-300 ease-out
        w-full max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl mx-4
        ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        flex flex-col max-h-[85vh]   /* <-- 컬럼 레이아웃 + 최대 높이 */
      `}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 헤더 (스티키) */}
      <div className='sticky top-0 z-10 bg-white flex items-center justify-between p-6 border-b border-gray-200'>
        <h2 className='text-xl font-bold'>
          {initialData ? '의사 정보 수정' : '의사 정보 추가'}
        </h2>
        <button
          onClick={handleClose}
          className='p-2 hover:bg-gray-100 rounded-full transition-colors'
        >
          <X size={24} className='text-gray-600' />
        </button>
      </div>

      {/* 컨텐츠 (스크롤 영역) */}
      <div className='flex-1 overflow-y-auto p-6 space-y-6'>
          {/* 사진 업로드 */}
          <div>
            <h3 className='text-sm font-medium text-gray-700 mb-3'>
              프로필 사진
            </h3>

            {/* 현재 이미지가 있는 경우 */}
            {imagePreview ? (
              <div className='flex justify-center mb-4'>
                <div className='relative group w-[120px] h-[120px] rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200'>
                  <Image
                    src={imagePreview}
                    alt='프로필 미리보기'
                    width={120}
                    height={120}
                    className='object-cover rounded-full'
                  />

                  {/* 기본 이미지가 아닐 때만 삭제 버튼 표시 */}
                  {/* {!useDefaultImage && ( */}
                    <button
                      type='button'
                      onClick={handleDeleteImage}
                      className='
                        absolute top-2 right-2 
                        transition-opacity duration-200
                        bg-white rounded-full p-1
                        hover:bg-red-50 hover:scale-110
                        transform transition-transform
                        shadow-lg border-2 border-white
                        z-10
                      '
                    >
                      <XCircleIcon
                        size={16}
                        className='text-red-500 hover:text-red-600'
                        strokeWidth={2}
                      />
                    </button>
                  )
                  {/* } */}
                </div>
              </div>
            ) : (
              /* 이미지가 없는 경우 드롭존 표시 */
              <div
                {...getRootProps()}
                className={`${getDropzoneStyle()} rounded-lg p-6 mb-4 text-center`}
              >
                <input {...getInputProps()} />
                <div className='flex flex-col items-center justify-center space-y-2'>
                  {isDragActive ? (
                    <>
                      <Upload className='w-8 h-8 text-blue-500' />
                      <p className='text-sm font-medium text-blue-600'>
                        {isDragAccept
                          ? '파일을 여기에 놓으세요!'
                          : '지원하지 않는 파일입니다'}
                      </p>
                    </>
                  ) : (
                    <>
                      <ImageIcon className='w-8 h-8 text-gray-400' />
                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-gray-600'>
                          이미지를 드래그하거나 클릭하여
                          업로드
                        </p>
                        <p className='text-xs text-gray-500'>
                          JPEG, PNG, GIF, WebP (1장만)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 기본 이미지 선택 */}
            <div className='flex gap-4 justify-center'>
              {DEFAULT_IMAGES.map((img) => (
                <label
                  key={img.key}
                  className='flex items-center gap-2 cursor-pointer'
                >
                  <input
                    type='checkbox'
                    checked={
                      useDefaultImage &&
                      defaultImageType === img.key
                    }
                    onChange={handleDefaultImageChange(
                      img.key as 'man' | 'woman',
                    )}
                    className='w-4 h-4'
                  />
                  <Image
                    src={img.src}
                    alt={img.label}
                    width={24}
                    height={24}
                    className='rounded-full border border-gray-200'
                  />
                  <span className='text-xs text-gray-700'>
                    {img.label}
                  </span>
                </label>
              ))}
            </div>
            <p>디폴트 이미지는 바뀔 수 있습니다. </p>
          </div>

          {/* 이름 입력 */}
          <div className="flex items-center mb-4">
            
            <label className='w-32 text-sm font-medium text-gray-700 mb-2'>
              이름 <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                onUserChanged?.('doctors:text');
              }}
              placeholder='의사 이름을 입력하세요'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
            />
            </div>
            <div className="flex items-center mb-4">
             <label className='w-32 text-sm font-medium text-gray-700 mt-2 mb-2'>
              Name En <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={nameEn}
              onChange={(e) => {
                setNameEn(e.target.value);
                onUserChanged?.('doctors:text');
              }}
              placeholder='insert doctor name in English'
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
            />
          </div>

      
          {/* 약력 / bio En: 좌우 배치 */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* 약력 - 왼쪽 */}
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                약력
              </label>
              <textarea
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  onUserChanged?.('doctors:text');
                }}
                placeholder="의사 소개를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-y min-h-40"
                style={{ whiteSpace: "pre-wrap" }}
              />
            </div>

            {/* bio En - 오른쪽 */}
            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                bio En
              </label>
              <textarea
                value={bioEn}
                onChange={(e) => {
                  setBioEn(e.target.value);
                  onUserChanged?.('doctors:text');
                }}
                placeholder="insert bio in English"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-y min-h-40"
                style={{ whiteSpace: "pre-wrap" }}
              />
            </div>
          </div>
        </div>


        {/* 하단 버튼 */}
        <div className='flex gap-3 p-6 border-t border-gray-200'>
          <button
            onClick={handleClose}
            className='flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorInfoForm;
