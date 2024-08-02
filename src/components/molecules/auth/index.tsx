import { ROUTE } from "@/router";

import Link from "next/link";

import styles from "./auth-header.module.scss";
import Button from "@/components/atoms/button";

import { getUserAPI } from "@/app/api/auth/getUser";
import { User } from "@supabase/supabase-js";

const Auth = async () => {
  const users = await getUserAPI();

  const href = users ? ROUTE.MY_PAGE : ROUTE.LOGIN;

  const text = (user: User) => {
    const { app_metadata, user_metadata, ...rest } = user;

    const isSnsUser = app_metadata.provider !== "email";

    return isSnsUser ? user_metadata.name : user_metadata.nickname;
  };

  const isAdmin = users?.user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <div className={styles.auth_header}>
      <Link href={href}>
        <Button color="blue">
          {users ? text(users.user) || users.user.email : "LOGIN"}
        </Button>
      </Link>
      {isAdmin && <Link href={ROUTE.UPLOAD_HOSPITAL}>업로드 바로가기</Link>}
    </div>
  );
};

export default Auth;
