"use client";

import { UserOutputDto } from "@/app/api/auth/getUser/getUser.dto";
import LogoutAction from "@/components/molecules/LogoutAction";
import { User } from "@supabase/supabase-js";
import { ArrowLeft, Camera, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { findCountry } from "@/constants/country";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/router";
import ModalAttendanceButton from "@/components/template/ModalAttendanceButton";
import AttendanceSection from "@/components/template/AttendanceSection";
import AttendanceModalButton from "@/components/template/AttendanceModalButton2";

interface MyPageMyInfoClientDetailProps {
  user: UserOutputDto;
}

export default function MyPageMyInfo({ user }: MyPageMyInfoClientDetailProps) {
  const router = useRouter();

  const handleProfileNavigation = () => {
    if (user?.userInfo?.uuid) {
      router.push(`/onboarding/complete-profile?code=${user.userInfo.uuid}&returnUrl=/user/my-page`);
    }
  };

  const renderProfileField = (label: string, value: string | undefined | null, needsUpdate: boolean) => (
    <div className="flex justify-between items-center p-4 border-b">
      <span className="text-gray-600">{label}</span>
      <div className="flex items-center cursor-pointer" onClick={needsUpdate ? handleProfileNavigation : undefined}>
        <span className={needsUpdate ? "text-red-500" : ""}>
          {value || "Need to set"}
        </span>
        <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center border-b">
          <Link href="/user/my-page" className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-medium ml-2">Modify My Information</h1>
        </div>

        <div className="p-4">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <Image
                  src={user?.userInfo?.avatar || "/default/profile_default.png"}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-medium">{user?.userInfo?.nickname || ""}</h2>
          </div>

          {/* Info List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">My Information</h3>
            {/* <ModalAttendanceButton /> */}
            {/* <AttendanceSection /> */}
            <AttendanceModalButton />
            <div className="bg-white rounded-lg">
              {renderProfileField("Gender", user?.userInfo?.gender ? (user.userInfo.gender === "M" ? "Male" : "Female") : null, !user?.userInfo?.gender)}
              {renderProfileField("Nationality", findCountry(user?.userInfo?.id_country)?.country_name, !findCountry(user?.userInfo?.id_country)?.country_name)}
              {renderProfileField("Phone Number Verification", "Phone Number Verification", false)}
              {renderProfileField("Email", user?.userInfo?.email, false)}
              {renderProfileField("Secondary Email", user?.userInfo?.secondary_email, false)}
              {renderProfileField("Treatment Experience", "Public", false)}

              <div className="flex justify-between items-center p-4">
                <span className="text-gray-600"></span>
                <div className="flex items-center">
                  <LogoutAction />
                </div>
              </div>
              <div className="flex justify-between items-center p-4 border-t">
                <span className="text-gray-600">Account</span>
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
