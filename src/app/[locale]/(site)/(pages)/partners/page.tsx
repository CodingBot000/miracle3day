import { Metadata } from 'next';
import KBeautyResources from './kbeauty-resources';


// SEO Metadata
export const metadata: Metadata = {
  title: 'K-Beauty Partners | Mimotok',
  description: 'Discover the best K-beauty shopping sites, educational resources, and communities. Your complete guide to Korean beauty products and information.',
  keywords: ['K-beauty', 'Korean beauty', 'skincare', 'cosmetics', 'Olive Young', 'beauty shopping', 'K-beauty blogs', 'Korean skincare'],
  openGraph: {
    title: 'K-Beauty Partners - Trusted Sites & Communities',
    description: 'Find the best places to shop K-beauty products and learn about Korean skincare',
    type: 'website',
    locale: 'en_US',
  },
};

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <KBeautyResources />
    </main>
  );
}
