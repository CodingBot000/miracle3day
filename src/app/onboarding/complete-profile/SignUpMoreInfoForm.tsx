"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NationModal } from "@/app/auth/sign-up/components/modal/nations";
import { useRouter, useSearchParams } from "next/navigation";
import { updateProfileAPI } from "@/app/api/auth/update-profile";
import { CountryCode } from "@/app/models/country-code.dto";

interface SignUpMoreInfoFormProps {
  uuid: string;
}

interface FormData {
  displayName: string;
  fullName: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  gender: string;
  email: string;
}

const initialFormData: FormData = {
  displayName: "",
  fullName: "",
  birthYear: "",
  birthMonth: "",
  birthDay: "",
  gender: "",
  email: "",
};

export default function SignUpMoreInfoForm() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get('code');

  console.log("SignUpMoreInfoForm uuid", uuid);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [nation, setNation] = useState<CountryCode | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 현재 연도 계산
  const currentYear = new Date().getFullYear();
  // 14세 이상 제한을 위한 최소/최대 연도 계산
  const minYear = currentYear - 100;
  const maxYear = currentYear - 14;

  // 월 선택 옵션
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // 선택된 월의 일수 계산
  const getDaysInMonth = (year: string, month: string) => {
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  // 일 선택 옵션 생성
  const getDayOptions = () => {
    if (!formData.birthYear || !formData.birthMonth) return [];
    const daysInMonth = getDaysInMonth(formData.birthYear, formData.birthMonth);
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      return { value: day, label: day };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      if (!uuid) {
        setErrors(prev => ({ ...prev, uuid: "UUID is required" }));
        return;
      }

      if (!formData.displayName.trim()) {
        setErrors(prev => ({ ...prev, displayName: "Display name is required" }));
        return;
      }

      // Birth Date 검증
      if (!formData.birthYear || !formData.birthMonth || !formData.birthDay) {
        setErrors(prev => ({ ...prev, birthDate: "Birth date is required" }));
        return;
      }

      // Gender 검증
      if (!formData.gender) {
        setErrors(prev => ({ ...prev, gender: "Gender is required" }));
        return;
      }

      if (!nation?.country_code) {
        setErrors(prev => ({ ...prev, nation: "Please select your nationality" }));
        return;
      }

      // 이메일이 입력된 경우에만 유효성 검사
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
        return;
      }

      const response = await updateProfileAPI({
        uuid: uuid,
        displayName: formData.displayName,
        fullName: formData.fullName,
        nation: nation.country_code,
        birthYear: formData.birthYear,
        birthMonth: formData.birthMonth,
        birthDay: formData.birthDay,
        gender: formData.gender,
        email: formData.email
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // 성공 시 홈페이지로 이동
      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        setErrors(prev => ({ ...prev, submit: error.message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Display Name</Label>
              <p className="text-sm text-gray-500 mb-2">
                This name will be shown to other users.
                </p>
              <Input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                required
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <Label>Full Name (Optional)</Label>
              <p className="text-sm text-gray-500 mb-2">
                Please enter your legal name. 
                Only used for personalized medical consultations or appointment records.
                This information never be shown to other users.
                </p>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <Label>Birth Date</Label>
              <p className="text-sm text-gray-500 mb-2">
                You must be at least 14 years old.
                If you provide your exact date of birth, we can offer more personalized recommendations and consultations.</p>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={formData.birthMonth}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, birthMonth: value }))}
                >
                  <SelectTrigger className={errors.birthDate ? "border-red-500" : ""}>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={formData.birthDay}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, birthDay: value }))}
                >
                  <SelectTrigger className={errors.birthDate ? "border-red-500" : ""}>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDayOptions().map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={formData.birthYear}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, birthYear: value }))}
                >
                  <SelectTrigger className={errors.birthDate ? "border-red-500" : ""}>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
                      const year = String(maxYear - i);
                      return (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              {errors.birthDate && (
                <p className="text-sm text-red-500 mt-1">{errors.birthDate}</p>
              )}
            </div>

            <div>
              <Label>Gender</Label>
              <p className="text-sm text-gray-500 mb-2">
                Select your gender.
                Optimized treatment recommendations vary depending on your gender.
                </p>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="M" id="male" className={errors.gender ? "border-red-500" : ""} />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="F" id="female" className={errors.gender ? "border-red-500" : ""} />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
              {errors.gender && (
                <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
              )}
            </div>

            <div>
              <NationModal
                nation={nation?.country_name || ""}
                onSelect={(value: CountryCode) => setNation(value)}
              />
              {errors.nation && (
                <p className="text-sm text-red-500 mt-1">{errors.nation}</p>
              )}
            </div>

            <div>
              <Label>Email (Optional)</Label>
              <p className="text-sm text-gray-500 mb-2">
              If you signed up using social login, you can optionally provide a secondary email if you&apos;d like to receive additional information.

              </p>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {errors.submit && (
            <p className="text-sm text-red-500 mt-2">{errors.submit}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
