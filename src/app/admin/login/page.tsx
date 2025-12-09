import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function Home() {
  return (
    <div className="items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <AdminLoginForm />
      </main>
    </div>
  );
}
