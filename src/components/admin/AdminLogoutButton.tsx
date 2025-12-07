// components/AdminLogoutButton.tsx
"use client";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLogoutButton() {
  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    window.location.href = "/admin/login";
  };
  return <button onClick={handleLogout}>Logout</button>;
}
