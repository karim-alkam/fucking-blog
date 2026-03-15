import './globals.css';
import Navbar from './components/Navbar';
import NextTopLoader from 'nextjs-toploader';
import { Outfit, EB_Garamond } from 'next/font/google';
import ChunkErrorListener from './components/ChunkErrorListener';
import { BASE_URL, GOOGLE_VERIFICATION_ID, SITE_CONFIG } from './lib/constants';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond',
});

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: SITE_CONFIG.title,
    template: `%s // ${SITE_CONFIG.author.split(' ')[1].toUpperCase()}`,
  },
  description: SITE_CONFIG.description,
  keywords: ['Electrical Engineering', 'Embedded Systems', 'IoT', 'Web Development', 'Next.js', 'Digital Garden', 'Engineering Log'],
  authors: [{ name: SITE_CONFIG.author, url: '' }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.author,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: 'Karim Alkam - Digital Log',
    images: [
      {
        url: '/A-logo-w-bg.png',
        width: 4096,
        height: 4096,
        alt: 'Karim Alkam - Digital Log',
      },
    ],
  },
  verification: {
    google: GOOGLE_VERIFICATION_ID,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: ['/A-logo-w-bg.png'],
    creator: SITE_CONFIG.twitterHandle,
  },
  icons: {
    icon: [
      { url: '/A-logo-small.png', type: 'image/png' },
    ],
    shortcut: '/A-logo-small.png',
    apple: '/A-logo-small.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${ebGaramond.variable} bg-deep-space text-starlight min-h-screen flex flex-col font-sans selection:bg-brass selection:text-void-black font-light`}>
        <NextTopLoader color="#C5A869" height={3} showSpinner={false} zIndex={9999} shadow="0 0 10px rgba(197, 168, 105, 0.5)" />
        <ChunkErrorListener />
        <Navbar />
        <main className="flex-1 relative z-10">
          {children}
        </main>
        <footer id="site-footer" className="bg-void-black/80 backdrop-blur-md border-t border-brass/20 py-8 mt-auto relative z-10">
          <div className="container mx-auto px-4 text-center">
            <p className="font-serif italic text-aged-parchment/70">
              <span className="text-brass">©</span> {new Date().getFullYear()} Karim Alkam&apos;s Engineering Log. All rights reserved.
            </p>
          </div>
        </footer>
        {/* SVG background is applied in globals.css */}
      </body>
    </html>
  );
}