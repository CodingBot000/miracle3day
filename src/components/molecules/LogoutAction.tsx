"use client";

import { SignOutButton } from "@clerk/nextjs";

type LogoutActionProps = {
  label?: string;
};

export default function LogoutAction({ label = "Logout" }: LogoutActionProps) {
  return (
    <SignOutButton redirectUrl="/">
      <button
        type="button"
        className="rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
      >
        {label}
      </button>
    </SignOutButton>
  );
}
