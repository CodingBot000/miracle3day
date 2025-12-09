import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import AdminClientLayout from './AdminClientLayout';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

// SEO 완전 차단
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  other: {
    'google': 'notranslate',
  },
};

const geistSans = GeistSans;
const geistMono = GeistMono;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 봇 감지 및 차단
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';

  const botPatterns = [
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
  ];

  const isBot = botPatterns.some(pattern =>
    userAgent.toLowerCase().includes(pattern)
  );

  if (isBot) {
    notFound(); // 봇에게는 404 표시
  }

  return (
    <html lang="ko">
      <head>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="googlebot" content="noindex, nofollow" />
        <meta name="bingbot" content="noindex, nofollow" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AdminClientLayout>
          {children}
        </AdminClientLayout>
      </body>
    </html>
  );
}
