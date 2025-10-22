"use client";

import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { User as UserIcon } from "lucide-react";
import Image from "next/image";

type AuthClientProps = {
  iconColor?: string;
};

export default function AuthClient({ iconColor = "#000" }: AuthClientProps) {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <SignInButton
        mode="modal"
        forceRedirectUrl="/auth/continue"
        fallbackRedirectUrl="/auth/continue"
        signUpForceRedirectUrl="/auth/continue"
        signUpFallbackRedirectUrl="/auth/continue"
        oauthFlow="redirect"
      >
        <button
          type="button"
          aria-label="Sign in with Google"
          className="flex items-center justify-center transition-opacity hover:opacity-80"
        >
          <UserIcon size={24} style={{ color: iconColor }} />
        </button>
      </SignInButton>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {user?.imageUrl ? (
        <Image
          src={user.imageUrl}
          alt={user.fullName ?? "User"}
          width={24}
          height={24}
          className="h-6 w-6 rounded-full object-cover"
        />
      ) : (
        <UserIcon size={24} style={{ color: iconColor }} />
      )}
      <SignOutButton redirectUrl="/">
        <button className="text-sm px-2 py-1 rounded bg-black/80 text-white hover:bg-black transition-colors">
          Logout
        </button>
      </SignOutButton>
    </div>
  );
}
