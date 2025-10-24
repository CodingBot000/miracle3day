"use client";

type LogoutActionProps = {
  label?: string;
};

export default function LogoutAction({ label = "Logout" }: LogoutActionProps) {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md border border-transparent bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
    >
      {label}
    </button>
  );
}
