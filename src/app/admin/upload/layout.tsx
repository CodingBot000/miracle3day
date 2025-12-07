'use client';

import { FormModeProvider } from '@/contexts/admin/FormModeContext';
import { FormModeEnforcer } from '@/components/admin/FormModeEnforcer';
import { Toaster } from 'sonner';

export default function AdminUploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FormModeProvider defaultMode="read">
      <Toaster
        position="top-right"
        offset={80}
        duration={3000}
        richColors
      />
      <div className="min-h-screen">
        {/* FormModeEnforcer wraps only the main content */}
        {/* Header and Footer (PageHeader/PageBottom) stay outside and always interactive */}
        <FormModeEnforcer>
          {children}
        </FormModeEnforcer>
      </div>
    </FormModeProvider>
  );
}
  