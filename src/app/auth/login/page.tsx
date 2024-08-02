"use client";

import { ROUTE } from "@/router";
import Link from "next/link";

import styles from "./login.module.scss";
import { clsx } from "clsx";
import InputField from "@/components/molecules/form/input-field";

import { useFormAction } from "@/hooks/useFormAction";
import { signInActions, snsLoginActions, TSnsType } from "./actions";
import { AlertModal } from "@/components/template/modal/alert";
import { useRouter } from "next/navigation";
import SignUpButton from "./components/button/signUp";
import LoginButton from "./components/button/login";
import { useFormState } from "react-dom";
import { YoutubeIcon } from "@/components/icons/youtube";
import { TikTokIcon } from "@/components/icons/tiktok";
import { BlogIcon } from "@/components/icons/blog";

const snsLoginList: TSnsType[] = ["google", "facebook", "apple"];

// sns login icon
const iconList: Record<TSnsType, string | JSX.Element> = {
  apple: <YoutubeIcon />,
  facebook: <TikTokIcon />,
  google: <BlogIcon />,
};

const LoginPage = () => {
  const router = useRouter();
  const {
    errorMessage,
    formAction,
    state: { error },
  } = useFormAction({ action: signInActions });

  const [_, snsLoginAction] = useFormState(snsLoginActions, null);

  return (
    <main className={clsx("container", styles.main)}>
      <form action={formAction} className={styles.form}>
        <InputField
          label="Email"
          name="email"
          isError={!!error?.email?.length}
        />

        <InputField
          type="password"
          label="Password"
          name="password"
          isError={!!error?.password?.length}
        />

        <div className={styles.btn_group}>
          <LoginButton />
          <SignUpButton />
        </div>

        <div className={clsx(styles.center)}>
          <Link href={ROUTE.FORGET_PASSWORD}>Forget your password?</Link>
        </div>

        <div className={clsx(styles.center)}>Or</div>

        <div className={clsx(styles.center)}>
          <ul className={styles.sns}>
            {snsLoginList.map((sns) => {
              return (
                <li key={sns}>
                  {/* // icons 으로 대체 해야함 */}
                  <button
                    className={styles.snsBtn}
                    formAction={() => snsLoginAction(sns)}
                  >
                    {iconList[sns]}
                  </button>
                </li>
              );
            })}
          </ul>
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
