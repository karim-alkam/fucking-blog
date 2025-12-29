import './globals.css';
import Navbar from './components/Navbar';
import NextTopLoader from 'nextjs-toploader';

export const metadata = {
  title: 'Salameh',
  description: 'A personal blog built with love by Abdullah Salameh',
  icons: {
    icon: '/logo-me.png', // stored in public/my-logo.png
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-gray-100 min-h-screen flex flex-col">
        <NextTopLoader color="#3B82F6" height={3} showSpinner={false} />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-gray-800 text-gray-400 py-8">
          <div className="container mx-auto px-4 text-center">
            <p>© {new Date().getFullYear()} Salameh's Blog. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}