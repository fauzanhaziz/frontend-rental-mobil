import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/login/'], // Halaman admin tidak akan muncul di Google
    },
    sitemap: 'https://niagakaryamandiri-rentalmobilpadang.vercel.app/sitemap.xml',
  }
}