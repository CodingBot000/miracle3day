"use client";

import { UserOutputDto } from "@/app/api/auth/getUser/getUser.dto";
import LogoutAction from "@/components/molecules/LogoutAction";
import { User } from "@supabase/supabase-js";
import { ArrowLeft, Camera, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface MyPageMyInfoClientDetailProps {
  user: UserOutputDto;
}

export default function MyPageMyInfo({ user }: MyPageMyInfoClientDetailProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center border-b">
          <Link href="/user/my-page" className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-lg font-medium ml-2">내 정보 수정</h1>
        </div>

        <div className="p-4">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user?.userInfo?.avatar ? (
                  <Image
                    src={user.userInfo.avatar}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src="/default/profile_default.png"
                    alt="Default Profile"
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-medium">{user?.userInfo?.nickname || "asdfasfd"}</h2>
          </div>

          {/* Info List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">내 정보</h3>
            
            <div className="bg-white rounded-lg">
              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">닉네임</span>
                <div className="flex items-center">
                  <span>{user?.userInfo?.nickname || "asdfasfd"}</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">이름</span>
                <div className="flex items-center">
                  <span className="text-gray-400">이름이 설정되어 있지 않습니다.</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">성별</span>
                <div className="flex items-center">
                  <span>{user?.userInfo?.gender === "M" ? "남성" : "여성"}</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">출생연도</span>
                <div className="flex items-center">
                  <span>1977</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">전화번호 인증</span>
                <div className="flex items-center">
                  <span className="text-blue-600">전화번호 인증</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">이메일</span>
                <div className="flex items-center">
                  <span>{user?.userInfo?.email || "pokerface582@nate.com"}</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">국적</span>
                <div className="flex items-center">
                  <span>{user?.userInfo?.id_country || "KR"}</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">시술 경험</span>
                <div className="flex items-center">
                  <span>공개</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4">
                <span className="text-gray-600">로그아웃</span>
                <div className="flex items-center">
                  <LogoutAction />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
