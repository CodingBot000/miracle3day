"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { createStorageCompat } from "@/lib/storageCompat";
import { useUserStore } from "@/stores/useUserStore";

const STORAGE_MEMBER = "member";

interface ProfileImageCardProps {
  userUuid: string;
  initialAvatarUrl?: string;
  onAvatarUpdate?: (newUrl: string) => void;
  title?: string;
  className?: string;
}

export default function ProfileImageCard({
  userUuid,
  initialAvatarUrl = "/default/profile_default.png",
  onAvatarUpdate,
  title = "Profile Photo",
  className = "",
}: ProfileImageCardProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>(initialAvatarUrl);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateAvatar } = useUserStore();

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setNewImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setNewImageFile(file);
  };

  const handleSaveProfileImage = async () => {
    if (!newImageFile || !userUuid) return;

    setIsUploadingImage(true);

    try {
      const fileExt = newImageFile.name.split(".").pop();
      const fileName = `profile_${userUuid}.${fileExt}`;
      const filePath = `${userUuid}/profile/${fileName}`;

      const storage = createStorageCompat();
      const bucket = storage.from(STORAGE_MEMBER);

      // List and delete existing profile images
      const { data: existingFiles } = await bucket.list(`${userUuid}/profile`);
      if (existingFiles && existingFiles.length > 0) {
        const pathsToDelete = existingFiles
          .map((item) => item.name?.trim())
          .filter(Boolean)
          .map((name) => `${userUuid}/profile/${name}`);

        if (pathsToDelete.length > 0) {
          await bucket.remove(pathsToDelete as string[]);
        }
      }

      // Upload new image
      const { error: uploadError } = await bucket.upload(filePath, newImageFile, { upsert: true });

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload image");
      }

      // Update avatar in database
      const storagePath = `${STORAGE_MEMBER}/${filePath}`;
      const patchRes = await fetch("/api/auth/member/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: storagePath }),
      });

      if (!patchRes.ok) {
        throw new Error("Failed to update avatar in database");
      }

      const patchData = await patchRes.json();
      const newAvatarUrl = patchData.avatarUrl;

      setAvatarUrl(newAvatarUrl);
      setNewImageFile(null);
      setNewImagePreview(null);
      updateAvatar(newAvatarUrl);
      onAvatarUpdate?.(newAvatarUrl);
      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const hasImageChange = newImageFile !== null;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={handleImageClick}
            >
              <Image
                src={newImagePreview || avatarUrl}
                alt="Profile"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
            <button
              onClick={handleImageClick}
              disabled={isUploadingImage}
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <p className="text-sm text-gray-500">Click the image to change</p>
        </div>
        <button
          onClick={handleSaveProfileImage}
          disabled={!hasImageChange || isUploadingImage}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            hasImageChange && !isUploadingImage
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isUploadingImage ? "Saving..." : "Save Photo"}
        </button>
      </div>
    </div>
  );
}
