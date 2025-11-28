// src/app/layout.tsx
import '../styles/globals.scss';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // html, body 태그는 [locale]/layout.tsx에서 처리
  return children;
}
