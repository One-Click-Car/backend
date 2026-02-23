
import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'One-Click-Car AI | Find Your Dream Car',
  description: 'AI-powered car search and listing platform. Find or sell your car with just a few words.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <FirebaseClientProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t py-12 px-6 text-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} One-Click-Car AI. All rights reserved.</p>
          </footer>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
