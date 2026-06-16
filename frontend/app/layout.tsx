import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import GoogleOneTap from '@/components/GoogleOneTap';
import Providers from '@/lib/providers';

const hankenGrotesk = Outfit({ subsets: ['latin'], variable: '--font-sans' });
const geist = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-body' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export const metadata: Metadata = {
  title: 'CodeNexus | Join the Conversation',
  description: 'The leading space for technical narratives.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${hankenGrotesk.variable} ${geist.variable} ${jetbrainsMono.variable} bg-background text-foreground font-body-md min-h-screen overflow-x-hidden w-full max-w-[100vw] transition-colors duration-300`}>
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
