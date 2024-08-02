"use client";

import styles from "./sign-up.module.scss";

import InputField from "@/components/molecules/form/input-field";

import { ROUTE } from "@/router";

import signUpActions from "./actions/sign-up.action";

import Link from "next/link";
import { NationModal } from "./components/modal/nations";

import SignUpButton from "./components/button/sign-up";
import { useFormState } from "react-dom";
import { ChangeEvent, useEffect, useState } from "react";
import { emailRegExp, passwordRegExp } from "@/utils/regexp";
import { AlertModal } from "@/components/template/modal/alert";

type InputKey = "email" | "password" | "password_confirm" | "name" | "nickname";

type State = {
  [key in InputKey]: { value: string; error: boolean };
};

const SignUpPage = () => {
  const [state, formAction] = useFormState<
    { message: string | null },
    FormData
  >(signUpActions, { message: null });

  const [message, setMessage] = useState<string | null>(null);

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
  });

  const inputFields: { label: string; name: InputKey }[] = [
    { label: "Email", name: "email" },
    { label: "Password", name: "password" },
    { label: "Password Confirm", name: "password_confirm" },
    { label: "Name", name: "name" },
    { label: "Nickname", name: "nickname" },
  ];

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const regValid = (name: InputKey, value: string) => {
      const reg: Record<Exclude<InputKey, "name" | "nickname">, RegExp> = {
        email: emailRegExp,
        password: passwordRegExp,
        password_confirm: passwordRegExp,
      };

      if (name === "password_confirm") {
        return !reg[name].test(value) || input["password"].value !== value;
      } else if (name === "nickname" || name === "name") {
        return false;
      }

      return !reg[name].test(value);
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

  const disabled = Object.values(input).every((e) => !e.error && e.value);

  useEffect(() => {
    if (state.message) {
      setMessage(state.message);
    }
  }, [state]);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Sign Up</h1>
      <form className={styles.form} action={formAction}>
        {inputFields.map(({ label, name }) => (
          <div key={name} className={styles.input_field}>
            <InputField
              label={label}
              name={name}
              type={name.startsWith("password") ? "password" : "text"}
              onChange={handleChange}
              value={input[name]?.value}
              isError={input[name]?.error}
            />
          </div>
        ))}

        <div className={styles.input_field}>
          <NationModal />
        </div>

        <div className={styles.btn}>
          <SignUpButton disabled={disabled} />
        </div>

        <Link className={styles.rollback} href={ROUTE.LOGIN}>
          Already have an account? Log in
        </Link>
      </form>

      <AlertModal open={!!message} onCancel={() => setMessage(null)}>
        <p>{state?.message}</p>
      </AlertModal>
    </main>
  );
};

export default SignUpPage;
