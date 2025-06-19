"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NationModal } from "@/app/auth/sign-up/components/modal/nations";
import { useRouter, useSearchParams } from "next/navigation";
import { updateProfileAPI } from "@/app/api/auth/update-profile";
import { CountryCode } from "@/app/models/country-code.dto";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

interface FormData {
  displayName: string;
  fullName: string;
  birthDate: Date | null;
  gender: string;
  email: string;
}

const initialFormData: FormData = {
  displayName: "",
  fullName: "",
  birthDate: null,
  gender: "",
  email: "",
};

// 14세 이상 제한을 위한 날짜 계산
const getMaxDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 14);
  return date;
};

// 100세 제한을 위한 날짜 계산
const getMinDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 100);
  return date;
};

const CustomInput = ({ value, onClick, placeholder, className }: any) => (
  <div className="flex items-center cursor-pointer" onClick={onClick}>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-5 w-5 text-gray-400 mr-2"
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
      />
    </svg>
    <input 
      value={value || ''} 
      className={`${className} cursor-pointer`}
      placeholder={placeholder}
      readOnly
    />
  </div>
);

export default function SignUpMoreInfoForm() {
  const searchParams = useSearchParams();
  const uuid = searchParams.get('code');
  const returnUrl = searchParams.get('returnUrl') || "/";

  console.log("SignUpMoreInfoForm uuid", uuid);
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [nation, setNation] = useState<CountryCode | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      if (!formData.birthDate) {
        setErrors(prev => ({ ...prev, birthDate: "Birth date is required" }));
        return;
      }

      if (!formData.gender) {
        setErrors(prev => ({ ...prev, gender: "Gender is required" }));
        return;
      }

      if (!nation?.country_code) {
        setErrors(prev => ({ ...prev, nation: "Please select your nationality" }));
        return;
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
        return;
      }

      const response = await updateProfileAPI({
        uuid: uuid,
        displayName: formData.displayName,
        fullName: formData.fullName,
        nation: nation.country_code,
        birthYear: formData.birthDate.getFullYear().toString(),
        birthMonth: (formData.birthDate.getMonth() + 1).toString().padStart(2, '0'),
        birthDay: formData.birthDate.getDate().toString().padStart(2, '0'),
        gender: formData.gender,
        email: formData.email
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // router.push("/");
      router.push(returnUrl);
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
        <h1 className="text-3xl font-bold text-center text-gray-900">
          Additional Information
        </h1>
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
                autoComplete="nickname"
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
                autoComplete="name"
              />
            </div>

            <div>
              <Label>Birth Date</Label>
              <p className="text-sm text-gray-500 mb-2">
                You must be at least 14 years old.
                If you provide your exact date of birth, we can offer more personalized recommendations and consultations.</p>
              <div className="relative">
                <div 
                  className={`border rounded-md ${
                    errors.birthDate ? "border-red-500" : "border-input"
                  }`}
                >
                  <DatePicker
                    selected={formData.birthDate}
                    onChange={(date: Date | null) => setFormData(prev => ({ ...prev, birthDate: date }))}
                    dateFormat="yyyy-MM-dd"
                    maxDate={getMaxDate()}
                    minDate={getMinDate()}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="Select your birth date"
                    className="w-full p-2 outline-none bg-transparent"
                    customInput={<CustomInput />}
                  />
                </div>
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
