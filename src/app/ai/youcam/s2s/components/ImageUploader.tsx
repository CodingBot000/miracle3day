'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
}

export default function ImageUploader({ onImageSelect, selectedImage }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG or PNG)');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageSelect(file);
  }, [onImageSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-upload"
          className="hidden"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleChange}
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative w-full h-64">
              <Image
                src={preview}
                alt="Selected image"
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                {selectedImage?.name}
              </p>
              <label
                htmlFor="image-upload"
                className="inline-block px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Change Image
              </label>
            </div>
          </div>
        ) : (
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-600 mb-2">
              Drag & drop your image here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              JPEG or PNG, max 10MB
            </p>
          </label>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-sm text-blue-900 mb-2">
          Tips for best results:
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Use a clear, well-lit photo</li>
          <li>• Face should be centered and take up most of the frame</li>
          <li>• Remove makeup for most accurate results</li>
          <li>• Avoid shadows on the face</li>
        </ul>
      </div>
    </div>
  );
}