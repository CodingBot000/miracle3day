import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consultation Flow - MimoTok',
  // 상담/문진 페이지 SEO 정책은 필요에 따라 조정 가능
};

export default function ConsultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
