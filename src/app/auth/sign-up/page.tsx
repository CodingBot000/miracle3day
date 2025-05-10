"use client";

import styles from "./sign-up.module.scss";
import { ROUTE } from "@/router";
import Link from "next/link";
import { NationModal } from "./components/modal/nations";
import SignUpButton from "./components/button/sign-up";
import { ChangeEvent, useEffect, useState } from "react";
import { emailRegExp, passwordRegExp } from "@/utils/regexp";
import { AlertModal } from "@/components/template/modal/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import signUpActions from "./actions/sign-up.action";
import { clsx } from "clsx";

type InputKey = "email" | "password" | "password_confirm" | "name" | "nickname" | "nation";

type State = {
  [key in InputKey]: { value: string; error: boolean };
};

const SignUpPage = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<{ [key in InputKey]?: string[] } | null>(null);
  const [nation, setNation] = useState<string>("");

  const [input, setInput] = useState<State>({
    email: {
      error: false,
      value: "",
    },
    name: {
      error: false,
      value: "",
    },
    nickname: {
      error: false,
      value: "",
    },
    password: {
      error: false,
      value: "",
    },
    password_confirm: {
      error: false,
      value: "",
    },
    nation: {
      error: false,
      value: "",
    },
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const regValid = (name: InputKey, value: string) => {
      const reg: Record<Exclude<InputKey, "name" | "nickname" | "nation">, RegExp> = {
        email: emailRegExp,
        password: passwordRegExp,
        password_confirm: passwordRegExp,
      };

      if (name === "password_confirm") {
        return !reg[name].test(value) || input["password"].value !== value;
      } else if (name === "nickname" || name === "name" || name === "nation") {
        return false;
      } else {
        return !reg[name].test(value);
      }
    };

    const inputKey = name as InputKey;

    setInput((prev) => ({
      ...prev,
      [inputKey]: {
        ...prev[inputKey],
        value,
        error: regValid(inputKey, value),
      },
    }));
  };

  const handleSubmit = async (formData: FormData) => {
    const invalidFields = Object.entries(input).filter(([_, field]) => field.error || !field.value);
    const errors: { [key in InputKey]?: string[] } = {};
  
    if (invalidFields.length > 0) {
      invalidFields.forEach(([key]) => {
        errors[key as InputKey] = ["This field is required or invalid."];
      });
    }

    try {
      const result = await signUpActions(null, formData);
      if (result.error) {
        setFormError(result.error);
      } else if (result.message) {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage("An error occurred during sign-up.");
    }
  };

  // const disabled = Object.values(input).every((e) => e.error && !e.value);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Sign Up</h1>
      <form className={styles.form} action={handleSubmit}>
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
                value={input.email.value}
                onChange={handleChange}
                className={clsx("pl-10", { "border-red-500": input.email.error || !!formError?.email?.length })}
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
                value={input.password.value}
                onChange={handleChange}
                className={clsx("pl-10", { "border-red-500": input.password.error || !!formError?.password?.length })}
              />
            </div>
            {formError?.password?.length && (
              <p className="text-sm text-red-500">{formError.password[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirm">Password Confirm</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password_confirm"
                name="password_confirm"
                type="password"
                placeholder="Confirm your password"
                value={input.password_confirm.value}
                onChange={handleChange}
                className={clsx("pl-10", { "border-red-500": input.password_confirm.error || !!formError?.password_confirm?.length })}
              />
            </div>
            {formError?.password_confirm?.length && (
              <p className="text-sm text-red-500">{formError.password_confirm[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={input.name.value}
                onChange={handleChange}
                className={clsx("pl-10", { "border-red-500": input.name.error || !!formError?.name?.length })}
              />
            </div>
            {formError?.name?.length && (
              <p className="text-sm text-red-500">{formError.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="nickname"
                name="nickname"
                type="text"
                placeholder="Enter your nickname"
                value={input.nickname.value}
                onChange={handleChange}
                className={clsx("pl-10", { "border-red-500": input.nickname.error || !!formError?.nickname?.length })}
              />
            </div>
            {formError?.nickname?.length && (
              <p className="text-sm text-red-500">{formError.nickname[0]}</p>
            )}
          </div>
        </div>

        <div className={styles.input_field}>
          <NationModal nation={nation} onSelect={(value) => setNation(value)} />
          <input type="hidden" name="nation" value={nation} />
          {formError?.nation?.length && (
            <p className="text-sm text-red-500 mt-1">{formError.nation[0]}</p>
          )}
        </div>

        <div className="space-y-4 mt-6">
          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"

          >
            <UserPlus className="h-4 w-4" />
            Sign Up
          </Button>
          
          <Link href={ROUTE.LOGIN} className="block">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
            >
              Already have an account? Log in
            </Button>
          </Link>
        </div>
      </form>

      <AlertModal open={!!message} onCancel={() => setMessage(null)}>
        <p>{message}</p>
      </AlertModal>
    </main>
  );
};

export default SignUpPage;
