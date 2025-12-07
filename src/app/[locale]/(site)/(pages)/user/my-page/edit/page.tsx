"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { NationModal } from "@/components/template/modal/NationModal";
import { CountryCode } from "@/models/country-code.dto";
import { createStorageCompat } from "@/lib/storageCompat";
import { useUserStore } from "@/stores/useUserStore";
import { findCountry } from "@/constants/country";
import LoginRequiredModal from "@/components/template/modal/LoginRequiredModal";
import { ROUTE } from "@/router";

const STORAGE_MEMBER = "member";

export default function MyPageEdit() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Profile image states
  const [avatarUrl, setAvatarUrl] = useState<string>("/default/profile_default.png");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateAvatar } = useUserStore();

  // Form states
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("");
  const [nation, setNation] = useState<CountryCode | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secondaryEmail, setSecondaryEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/getUser");
        if (res.ok) {
          const userData = await res.json();
          if (userData.userInfo) {
            setUser(userData);
            // Initialize form with existing data
            const info = userData.userInfo;
            setAvatarUrl(info.avatar || "/default/profile_default.png");
            setNickname(info.nickname || "");
            setGender(info.gender || "");
            setSecondaryEmail(info.secondary_email || "");

            // Extract phone number without country code
            if (info.phone_number) {
              const phoneWithoutCode = info.phone_number.replace(/^\+\d+/, "");
              setPhoneNumber(phoneWithoutCode);
            }

            // Set nation from id_country
            if (info.id_country) {
              const country = findCountry(info.id_country);
              if (country) {
                setNation({
                  country_code: country.country_code,
                  country_name: country.country_name,
                  phone_code: country.phone_code,
                } as CountryCode);
              }
            }
          } else {
            setShowLoginModal(true);
          }
        } else {
          setShowLoginModal(true);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setShowLoginModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLoginConfirm = () => {
    setShowLoginModal(false);
    router.push(ROUTE.LOGIN);
  };

  const handleLoginCancel = () => {
    setShowLoginModal(false);
    router.push("/");
  };

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

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setNewImageFile(file);
  };

  const handleSaveProfileImage = async () => {
    if (!newImageFile || !user?.userInfo?.id_uuid) return;

    setIsUploadingImage(true);

    try {
      const userUuid = user.userInfo.id_uuid;
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
      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.userInfo?.id_uuid) return;

    setIsSaving(true);

    try {
      const phoneCode = nation?.phone_code || "82";
    //   const fullPhoneNumber = phoneNumber ? `+${phoneCode}${phoneNumber}` : null;

      const updateData = {
        nickname: nickname || null,
        gender: gender || null,
        id_country: nation?.country_code || null,
        phone_country_code: nation?.phone_code ? `+${nation.phone_code}` : null,
        phone_number: phoneNumber,
        secondary_email: secondaryEmail || null,
      };

      const res = await fetch("/api/auth/member/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      router.push("/user/my-page");
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const hasImageChange = newImageFile !== null;

  return (
    <>
      <LoginRequiredModal
        open={showLoginModal}
        onConfirm={handleLoginConfirm}
        onCancel={handleLoginCancel}
      />
      {user && (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-2xl mx-auto">
          {/*   
            <div className="flex items-center px-4 py-4 border-b bg-white">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold ml-2">Edit Profile</h1>
            </div> */}

            <div className="p-4 space-y-6">
              {/* Profile Image Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Profile Photo</h2>
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
                    <p className="text-sm text-gray-500">
                      Click the image to change
                    </p>
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

              {/* Profile Info Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                <div className="space-y-4">
                  {/* Nickname */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-600">Nickname</Label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your nickname"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-600">Gender</Label>
                    <RadioGroup
                      value={gender}
                      onValueChange={setGender}
                      className="flex flex-wrap gap-4 pt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="font-normal cursor-pointer">
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="font-normal cursor-pointer">
                          Female
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="font-normal cursor-pointer">
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Nationality */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-600">Nationality</Label>
                    <NationModal
                      nation={nation?.country_name || ""}
                      onSelect={(value: CountryCode) => setNation(value)}
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                    <div className="flex gap-2">
                      <div className="w-24 flex-shrink-0">
                        <input
                          type="text"
                          value={nation?.phone_code ? `+${nation.phone_code}` : "+82"}
                          readOnly
                          className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-center font-medium text-gray-700"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secondary Email */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-600">Secondary Email</Label>
                    <input
                      type="email"
                      value={secondaryEmail}
                      onChange={(e) => setSecondaryEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter secondary email (optional)"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-6">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
