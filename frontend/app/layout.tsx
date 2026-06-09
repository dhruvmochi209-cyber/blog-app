import type { Metadata } from 'next';
import { Hanken_Grotesk, Geist, JetBrains_Mono } from 'next/font/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import GoogleOneTap from '@/components/GoogleOneTap';
import Providers from '@/lib/providers';

const hankenGrotesk = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-sans' });
const geist = Geist({ subsets: ['latin'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export const metadata: Metadata = {
  title: 'DevLog | Join the Conversation',
  description: 'The leading space for technical narratives.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${hankenGrotesk.variable} ${geist.variable} ${jetbrainsMono.variable} bg-background text-foreground font-body-md min-h-screen transition-colors duration-300`}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <Providers>
              <GoogleOneTap />
              {children}
            </Providers>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
