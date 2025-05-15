"use client";

import Button from "@/components/atoms/button/Button";
import { logoutAction } from "@/app/auth/logout/logoutAction";

export default function LogoutAction() {
  return (
    <form action={logoutAction}>
      <Button color="red" variant="outline">
        LOGOUT
      </Button>
    </form>
  );
}
