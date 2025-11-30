"use client";

import { UserOutputDto } from "@/app/api/auth/getUser/getUser.dto";
import LogoutAction from "@/components/molecules/LogoutAction";
import { Calendar, Camera, ChevronRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";;
import { findCountry } from "@/constants/country";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/router";
import { fetchPoint } from "@/services/attendance";
import { useEffect, useState, useRef } from "react";
import { uploadProfileImage } from "@/services/profileImage";
import { toast } from "sonner";
import BadgeSection from "@/components/mypage/BadgeSection";
import { useUserStore } from "@/stores/useUserStore";
import { log } from "@/utils/logger";

interface MyPageMyInfoClientDetailProps {
  user: UserOutputDto;
}

export default function MyPageMyInfo({ user }: MyPageMyInfoClientDetailProps) {
  const router = useRouter();
  const [point, setPoint] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.userInfo?.avatar || "/default/profile_default.png");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateAvatar } = useUserStore();
  
  log.debug("MyPageMyInfo user", user);
  log.debug("MyPageMyInfo user?.userInfo?.id_uuid:", user?.userInfo?.id_uuid);

  useEffect(() => {
    void loadTodayAttendance();

    // 페이지 진입 시 body 스크롤 강제 복원 (모달에서 돌아왔을 때 스크롤 안 되는 이슈 방지)
    document.body.style.overflow = 'auto';
    document.body.style.position = '';
    document.body.style.width = '';

    return () => {
      // cleanup
    };
  }, []);
  const handleProfileNavigation = () => {
    if (user?.userInfo?.id_uuid) {
      router.push(`/login/onboarding/complete-profile?code=${user.userInfo.id_uuid}&returnUrl=/user/my-page`);
    }
  };

  async function loadTodayAttendance() {
    try {
      const curPoint = await fetchPoint();
      setPoint(curPoint);
    } catch (e) {
      console.error(e);
      // setHasCheckedInToday(false);
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.userInfo?.id_uuid) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.success('Please select an image file');
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadProfileImage({
        file,
        userUuid: user.userInfo.id_uuid,
      });

      if (result.success && result.imagePath) {
        setAvatarUrl(result.imagePath);
        updateAvatar(result.imagePath); // 전역 store 업데이트
        toast.success('Profile image updated successfully');
      } else {
        toast.error(`Failed to upload image: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const renderProfileField = (label: string, value: string | undefined | null, needsUpdate: boolean) => (
    <div className="flex justify-between items-center p-4 border-b">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center cursor-pointer" onClick={needsUpdate ? handleProfileNavigation : undefined}>
        <span className={needsUpdate ? "text-red-500" : ""}>
          {value || "Need to set"}
        </span>
        {/* <ChevronRight className="w-5 h-5 ml-2 text-gray-400" /> */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        {/* <div className="flex-col px-4 py-4 flex items-center border-b">
          <Link href="/user/my-page" className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </Link> 
          <h1 className="text-lg font-bold ml-2">My Page</h1>
        </div> */}

        <div className="p-4">
          {/* Profile Image Section */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <Image
                    src={avatarUrl}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="object-cover  w-full h-full"
                  />
                </div>
                {/* <button
                  onClick={handleCameraClick}
                  disabled={isUploading}
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
                /> */}
              </div>
              <h2 className="text-xl font-medium">{user?.userInfo?.nickname || ""}</h2>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/user/my-page/edit")}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Badge Section */}
          {user?.userInfo?.id_uuid && (
            <div className="mb-8">
              <BadgeSection
                userUuid={user.userInfo.id_uuid}
                currentPoints={point}
              />
            </div>
          )}

          {/* Info List */}
          <div className="space-y-6">
            {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">My Information</h3> */}

            <div className="bg-white rounded-lg shadow-sm">
              {renderProfileField("Gender", user?.userInfo?.gender ? (user.userInfo.gender === "M" ? "Male" : "Female") : "other", !user?.userInfo?.gender)}
              {renderProfileField("Nationality", user?.userInfo?.id_country ? findCountry(user.userInfo.id_country)?.country_name : null, !user?.userInfo?.id_country)}
              {renderProfileField("Phone Number Verification", "Phone Number Verification", false)}
              {renderProfileField("Email", user?.userInfo?.email, false)}
              {renderProfileField("Secondary Email", user?.userInfo?.secondary_email, false)}
              
              {/*   {renderProfileField("Treatment Experience", "Public", false)} */}
              <div className="flex justify-between items-center p-4 border-t">
                <span className="text-gray-600">My Reservations</span>
                <Link href="/user/my-page/reservation-list" className="flex items-center text-gray-400 hover:text-gray-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
                         {/* chat */}
                         
              <div className="flex justify-between items-center p-4 border-t">
                <span className="text-gray-600">My Chatting List</span>
                <Link href="/user/my-page/chat-list" className="flex items-center text-gray-400 hover:text-gray-600">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              
              <div className="flex justify-between items-center p-4 border-t">
              <Link
                href="/legal/cookie-policy"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Cookie Policy
              </Link>
              </div>


              <div className="flex justify-between items-center p-4">
                <span className="text-gray-600"></span>
                <div className="flex items-center">
                  <LogoutAction />
                </div>
              </div>
              <div className="flex justify-between items-center p-4 border-t">
                {/* <span className="text-gray-600">Account</span> */}
                <div className="flex items-center">
                  <Link href={ROUTE.WITHDRAWAL} className="text-gray-400 hover:text-gray-500 text-sm">
                    Withdrawal
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
