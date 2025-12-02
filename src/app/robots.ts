import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/auth/',
        '/user/',
        '/login/',
        '/withdrawal/',
        '/continue/',
        '/terms/',
        '/mobile/consult/',
        '/mobile/consult-daily/',
        '/_next/',
        '/admin/',
      ],
    },
    sitemap: 'https://mimotok.com/sitemap.xml',
  };
}
