"use client";

import { UserOutputDto } from "@/app/api/auth/getUser/getUser.dto";
import Image from "next/image";
import Link from "next/link";
import { MoreVertical, Bookmark, CalendarCheck, Heart, Gift, PenLine, Bell } from "lucide-react";

interface MyPageMyIntroOtherClientProps {
  user: UserOutputDto;
}

export default function MyPageMyIntroOther({ user }: MyPageMyIntroOtherClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex justify-between items-center border-b">
          <h1 className="text-lg font-medium">My Page</h1>
          <button className="p-2">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-white px-4 py-6">
          <Link href="/user/profile" className="flex items-center space-x-3">
            <div className="relative w-16 h-16">
              <Image
                src={user?.userInfo?.avatar || "/default/profile-default.png"}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-medium">{user?.userInfo?.nickname || "asdfasfd"}</span>
                <span className="text-sm text-gray-500">›</span>
              </div>
              <div className="text-sm text-gray-500">Lv.1</div>
            </div>
          </Link>

          {/* Points */}
          <Link href="/points" className="mt-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold">Points</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="font-medium">0 Points</span>
              <span className="text-gray-400">›</span>
            </div>
          </Link>
        </div>

        {/* Menu List */}
        <div className="bg-white mt-2">
          {/* Main Menu */}
          <div className="space-y-1">
            <Link href="/activities" className="flex items-center px-4 py-3 hover:bg-gray-50">
              <Bookmark className="w-5 h-5 mr-3" />
              <span>Activities & Saved</span>
            </Link>
            <Link href="/reservations" className="flex items-center px-4 py-3 hover:bg-gray-50">
              <CalendarCheck className="w-5 h-5 mr-3" />
              <span>My Reservations & Payments</span>
            </Link>
            <Link href="/favorites" className="flex items-center px-4 py-3 hover:bg-gray-50">
              <Heart className="w-5 h-5 mr-3" />
              <span>Favorites</span>
            </Link>
            <Link href="/benefits" className="flex items-center px-4 py-3 hover:bg-gray-50">
              <Gift className="w-5 h-5 mr-3" />
              <div className="flex items-center">
                <span>Benefits</span>
                <div className="ml-2 w-2 h-2 bg-orange-500 rounded-full"></div>
              </div>
            </Link>
            <Link href="/reviews" className="flex items-center px-4 py-3 hover:bg-gray-50">
              <PenLine className="w-5 h-5 mr-3" />
              <span>Reviews</span>
            </Link>
            <Link href="/notifications" className="flex items-center px-4 py-3 hover:bg-gray-50">
              <Bell className="w-5 h-5 mr-3" />
              <span>Notifications</span>
            </Link>
          </div>

          {/* Activity Section */}
          <div className="mt-6 px-4 py-2">
            <h2 className="text-sm font-medium text-gray-500">Activity</h2>
            <Link href="/treatments" className="flex items-center py-3">
              <span>Before & After Photos</span>
            </Link>
          </div>

          {/* Settings Section */}
          <div className="mt-2 px-4 py-2">
            <h2 className="text-sm font-medium text-gray-500">Settings</h2>
            <div className="space-y-1">
              <Link href="/settings/treatments" className="flex items-center py-3">
                <span>Treatment Preferences</span>
              </Link>
              <Link href="/settings/location" className="flex items-center py-3">
                <span>Location Preferences</span>
              </Link>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-2 px-4 py-2">
            <h2 className="text-sm font-medium text-gray-500">Support</h2>
            <div className="space-y-1">
              <Link href="/support/center" className="flex items-center py-3">
                <span>Customer Support</span>
              </Link>
              <div className="flex items-center py-3">
                <span>Send Feedback</span>
                <span className="ml-2 text-sm text-orange-500 border border-orange-500 rounded-full px-2 py-0.5">
                  Send us your thoughts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
