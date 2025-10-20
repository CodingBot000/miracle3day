"use client";

import Button from "@/components/atoms/button/Button";
import { createClient } from "@/utils/session/client";
import { useRouter } from "next/navigation";
import { ROUTE } from "@/router";

export default function LogoutAction() {
  const backendClient = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Use signOut with scope: 'global' to ensure server-side logout
      const { error } = await backendClient.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Logout error:', error);
        return;
      }

      // Force clear all cookies by calling server logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Force page reload to ensure fresh server-side state
      window.location.href = ROUTE.HOME;
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Button 
      color="red" 
      variant="outline" 
      onClick={handleLogout}
      type="button"
    >
      LOGOUT
    </Button>
  );
}
