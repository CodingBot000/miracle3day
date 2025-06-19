"use client";

import { UserOutputDto } from "@/app/api/auth/getUser/getUser.dto";
import LogoutAction from "@/components/molecules/LogoutAction";
import { User } from "@supabase/supabase-js";
import { ArrowLeft, Camera, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { findCountry } from "@/constants/country";

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
            <h2 className="mt-4 text-xl font-medium">{user?.userInfo?.nickname || "asdfasfd"}</h2>
          </div>

          {/* Info List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">My Information</h3>
            
            <div className="bg-white rounded-lg">
              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">Display Name</span>
                <div className="flex items-center">
                  <span>{user?.userInfo?.nickname || "asdfasfd"}</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              {/* <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">이름</span>
                <div className="flex items-center">
                  <span className="text-gray-400">이름이 설정되어 있지 않습니다.</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div> */}

              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">Gender</span>
                <div className="flex items-center">
                  <span>{user?.userInfo?.gender === "M" ? "Male" : "Female"}</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              {/* <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">출생연도</span>
                <div className="flex items-center">
                  <span>1977</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div> */}

              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">Phone Number Verification</span>
                <div className="flex items-center">
                  <span className="text-blue-600">Phone Number Verification</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">Email</span>
                <div className="flex items-center">
                  <span>{user?.userInfo?.email || "pokerface582@nate.com"}</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">Secondary Email</span>
                <div className="flex items-center">
                  <span>{user?.userInfo?.secondary_email || "not set"}</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>


              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">Nationality</span>
                <div className="flex items-center">
                  <span>{findCountry(user?.userInfo?.id_country)?.country_name || ""}</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4 border-b">
                <span className="text-gray-600">Treatment Experience</span>
                <div className="flex items-center">
                  <span>Public</span>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                </div>
              </div>

              <div className="flex justify-between items-center p-4">
                <span className="text-gray-600"></span>
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
