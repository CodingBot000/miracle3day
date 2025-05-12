"use client";

import { ROUTE } from "@/router";
import Link from "next/link";

import { clsx } from "clsx";
import { useFormAction } from "@/hooks/useFormAction";
import { signInActions, snsLoginActions, TSnsType } from "./actions";
import { AlertModal } from "@/components/template/modal/alert";
import { useRouter } from "next/navigation";
import { YoutubeIcon } from "@/components/icons/youtube";
import { TikTokIcon } from "@/components/icons/tiktok";
import { BlogIcon } from "@/components/icons/blog";
import { GoogleIcon } from "@/components/icons/google";
import { AppleIcon } from "@/components/icons/apple";
import { FaceBookIcon } from "@/components/icons/facebook";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";

const snsLoginList: TSnsType[] = ["google", "facebook", "apple"];

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
    try {
      await snsLoginActions(null, sns);
    } catch (error) {
      setErrorMessage("Error Occured in SNS Login");
    }
  };

  return (
    <main className="container">
      <form
        action={handleSubmit}
        className="max-w-[380px] mx-auto flex flex-col items-center justify-center gap-2 h-full"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className={clsx("pl-10", { "border-red-500": !!formError?.email?.length })}
              />
            </div>
            {formError?.email?.length && (
              <p className="text-sm text-red-500">{formError.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className={clsx("pl-10", { "border-red-500": !!formError?.password?.length })}
              />
            </div>
            {formError?.password?.length && (
              <p className="text-sm text-red-500">{formError.password[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Button>
          
          <Link href={ROUTE.SIGN_UP} className="block">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </Button>
          </Link>
        </div>

        <div className="text-center mt-4">
          <Link 
            href={ROUTE.FORGET_PASSWORD} 
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            Forget your password?
          </Link>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {snsLoginList.map((sns) => (
            <Button
              key={sns}
              type="button" // form 제출을 트리거 하지않도록 하기 위해 추가
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => handleSnsLogin(sns)}
            >
              {iconList[sns]}
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
