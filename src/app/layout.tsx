import type { Metadata } from 'next';
import { EB_Garamond, Tiro_Bangla, Noto_Serif_Bengali } from 'next/font/google';
import './globals.css';

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const tiroBangla = Tiro_Bangla({
  subsets: ['bengali'],
  variable: '--font-tiro-bangla',
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  variable: '--font-noto-serif-bengali',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Words by Debangan | Bengali Poetry Book',
  description: 'An immersive digital book containing the selected poems and writings of Debangan. Experience literature in an organic, page-flipping layout.',
  keywords: ['Debangan', 'Bengali Poetry', 'Bangla Kobita', 'Book Reader', 'Kobita', 'Poems'],
  authors: [{ name: 'Debangan' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="bn" 
      className={`${ebGaramond.variable} ${tiroBangla.variable} ${notoSerifBengali.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
