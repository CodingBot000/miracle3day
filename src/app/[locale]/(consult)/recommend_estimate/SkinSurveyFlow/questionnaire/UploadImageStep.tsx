import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { compressSingleImage } from '@/utils/imageCompression';

interface UploadImageStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onSkip?: () => void; // Skip 기능을 위한 optional prop
}

const UploadImageStep: React.FC<UploadImageStepProps> = ({ data, onDataChange, onSkip }) => {
  const uploadImage = data.uploadImage || {};
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(uploadImage.uploadedImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    // 파일 크기 검증 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    // 지원되는 파일 형식 검증
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PNG and JPG, JPEG files can be uploaded');
      return;
    }

    try {
      // 이미지 압축 (제출 시점이 아닌 선택 시점에 압축하여 UX 향상)
      const { compressedFile, error } = await compressSingleImage(
        file,
        'review', // High quality for medical consultation images
        {
          maxSizeMB: 2.0, // Override for medical images (higher quality)
        }
      );

      if (error || !compressedFile) {
        console.error('Compression failed:', error);
        alert('Failed to process image. Please try another file.');
        return;
      }

      // 압축된 파일을 base64로 변환하여 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        onDataChange({
          ...data,
          uploadImage: {
            uploadedImage: result,
            imageFile: compressedFile, // Store compressed file, not original
            imageFileName: file.name
          }
        });
      };
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error('Image processing error:', error);
      alert('Failed to process image. Please try again.');
    }
  }, [data, onDataChange]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDeleteImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setUploadedImage(null);
    onDataChange({
      ...data,
      uploadImage: {
        uploadedImage: null,
        imageFile: null,
        imageFileName: null
      }
    });
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [data, onDataChange]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        {/* <Label className="text-lg font-medium text-gray-800 mb-2 block">
          Please post a picture to diagnose your skin
        </Label> */}
        <ul className="list-disc list-inside text-sm text-red-400 mb-1 space-y-1">
          <li>Please upload photos focusing on the area(s) you’d like to consult about.</li>
          <li>If you’d like a full-face evaluation, please provide a front-facing photo. Make sure your face occupies at least 60% of the image height.</li>
        </ul>

      </div>

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-rose-400 bg-rose-50' 
            : 'border-rose-300 hover:border-rose-400 hover:bg-rose-50'
          }
          ${uploadedImage ? 'border-solid border-rose-400 bg-rose-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpg,image/jpeg"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploadedImage ? (
          <div className="space-y-4 relative">
            <button
              onClick={handleDeleteImage}
              className="absolute top-0 right-0 -mt-2 -mr-2 z-10 w-8 h-8 bg-gray-500 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors duration-200"
              aria-label="Delete image"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <img
              src={uploadedImage}
              alt="Uploaded image"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
            />
            {/* <p className="text-sm text-gray-600">
              Click to change image
            </p> */}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-rose-500 rounded-lg flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Click or drag & drop images to upload
              </p>
              <p className="text-sm text-gray-600">
                You can upload up to 10MB.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Skip Button - Only shown when onSkip prop is provided */}
      {onSkip && (
        <div className="flex justify-center mt-6 mb-4">
          <Button
            onClick={onSkip}
            variant="ghost"
            className="text-red-500 font-bold hover:text-gray-700 text-sm underline"
          >
            Skip this step
          </Button>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="text-xs text-gray-500 leading-relaxed">
        All images are securely stored, and will not be used for any purpose other than diagnosis.
      </div>
    </div>
  );
};

export default UploadImageStep;
