"use client";

import { ROUTE } from "@/router";
import Link from "next/link";

import { clsx } from "clsx";
import { signInActions, snsLoginActions, TSnsType } from "./actions";
import { AlertModal } from "@/components/template/modal/Modal";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "@/components/icons/google";
import { AppleIcon } from "@/components/icons/apple";
import { FaceBookIcon } from "@/components/icons/facebook";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, LogIn } from "lucide-react";
import { useState } from "react";

import SignUpButton from "./components/button/signUp";
import { SNS_FACEBOOK, SNS_GOOGLE, SNS_APPLE } from "@/constants/key";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";

const snsLoginList: TSnsType[] = [SNS_GOOGLE, SNS_FACEBOOK, SNS_APPLE];

// sns login icon
const iconList: Record<TSnsType, string | JSX.Element> = {
  apple: <AppleIcon />,
  facebook: <FaceBookIcon />,
  google: <GoogleIcon />,
};

const LoginPage = () => {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<{ email?: string[]; password?: string[] } | null>(null);
  const { language } = useLanguage();
  const locale = language === "ko" ? "ko" : "en";

  const copy = {
    heading: {
      ko: "다시 만나 반가워요",
      en: "Welcome Back",
    },
    subtitle: {
      ko: "소셜 계정으로 함께 해요",
      en: "Continue with a social account",
    },
    socialIntro: {
      ko: "한 번의 클릭으로 시작하세요",
      en: "One click to get started",
    },

    socialButton: {
      google: {
        ko: "Google로 계속하기",
        en: "Continue with Google",
      },
      facebook: {
        ko: "Facebook으로 계속하기",
        en: "Continue with Facebook",
      },
      apple: {
        ko: "Apple로 계속하기",
        en: "Continue with Apple",
      },
    },
  };

  const socialButtonStyles: Record<TSnsType, string> = {
    google:
      "bg-white/90 text-slate-700 border border-slate-200 hover:bg-white shadow-sm hover:shadow-md",
    facebook:
      "bg-[#1877f2] text-white border border-[#1877f2] hover:bg-[#165fbe] shadow-md hover:shadow-lg",
    apple:
      "bg-black text-white border border-black hover:bg-neutral-900 shadow-md hover:shadow-lg",
  };

  const socialIconStyles: Record<TSnsType, string> = {
    google: "bg-white text-slate-700 shadow",
    facebook: "bg-white/20 text-white",
    apple: "bg-white/20 text-white",
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await signInActions(null, formData);
      if (result.error) {
        setFormError(result.error);
      } else if (result.message) {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("Error Occured in Login");
    }
  };

  const handleSnsLogin = async (sns: TSnsType) => {
    router.push(`/auth/terms?provider=${sns}`);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-[#667eea] via-[#6f60c8] to-[#764ba2] px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-40px] h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <form
        action={handleSubmit}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/30 bg-white/80 p-8 shadow-2xl backdrop-blur-2xl sm:p-10"
      >
        <div className="flex flex-col items-center text-center">
          {/* <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-3xl text-white shadow-lg">
            🚀
          </div> */}
         <Image
              src="/logo/logo_icon.png"
              alt="Logo"
              width={80}
              height={80}
      
            />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">
            {copy.heading[locale]}
          </h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            {copy.subtitle[locale]}
          </p>
        </div>

      
        <p className="text-center text-sm font-semibold text-slate-500">
          {copy.socialIntro[locale]}
        </p>

        <div className="mt-4 space-y-3">
          {snsLoginList.map((sns) => (
            <Button
              key={sns}
              type="button"
              variant="outline"
              className={clsx(
                "group flex h-12 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium transition-all",
                socialButtonStyles[sns]
              )}
              onClick={() => handleSnsLogin(sns)}
            >
              <span
                className={clsx(
                  "flex h-9 w-9 items-center justify-center rounded-full text-xl transition",
                  socialIconStyles[sns]
                )}
              >
                {iconList[sns]}
              </span>
              <span>{copy.socialButton[sns][locale]}</span>
            </Button>
          ))}
        </div>
      </form>

      <AlertModal
        open={!!errorMessage}
        onCancel={() => router.replace(ROUTE.LOGIN)}
      >
        <p>{errorMessage}</p>
      </AlertModal>
    </main>
  );
};

export default LoginPage;
