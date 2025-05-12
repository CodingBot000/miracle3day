"use client";

import LogoutAction from "@/components/molecules/LogoutAction";
import { User } from "@supabase/supabase-js";

interface MyPageClientProps {
  user: User;
}

export default function MyPageClient({ user }: MyPageClientProps) {
  return (
    <main className="flex mt-8 justify-center items-center gap-4">
      <div>{user?.user_metadata?.full_name ?? "Unknown User"}</div>
      <div>
        <LogoutAction />
      </div>
    </main>
  );
}
