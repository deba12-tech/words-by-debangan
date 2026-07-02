import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/book'],
      disallow: ['/admin/', '/admin'],
    },
    sitemap: 'https://wordsbydebangan.com/sitemap.xml',
  };
}
