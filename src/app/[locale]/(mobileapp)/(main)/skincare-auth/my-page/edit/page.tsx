"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { NationModal } from "@/components/template/modal/NationModal";
import { CountryCode } from "@/models/country-code.dto";
import { findCountry } from "@/constants/country";
import ProfileImageCard from "@/components/template/ProfileImageCard";
import BackHeader from "@/components/mobileapp/BackHeader";

export default function MyPageEdit() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
            // 로그인 안됨 → 바로 skincare 로그인 페이지로 이동
            router.replace("/skincare-auth/login");
          }
        } else {
          router.replace("/skincare-auth/login");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.replace("/skincare-auth/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!user?.userInfo?.id_uuid) return;

    setIsSaving(true);

    try {
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
      router.push("/skincare-auth/my-page");
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

  if (!user) {
    return null;
  }

  return (
    <>
      <BackHeader title="Edit Profile" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 space-y-6">
            {/* Profile Image Card */}
            <ProfileImageCard
            userUuid={user.userInfo.id_uuid}
            initialAvatarUrl={user.userInfo.avatar}
          />

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
                    <RadioGroupItem value="male" id="skincare-male" />
                    <Label htmlFor="skincare-male" className="font-normal cursor-pointer">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="skincare-female" />
                    <Label htmlFor="skincare-female" className="font-normal cursor-pointer">
                      Female
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="skincare-other" />
                    <Label htmlFor="skincare-other" className="font-normal cursor-pointer">
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
    </>
  );
}
