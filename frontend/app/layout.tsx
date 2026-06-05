import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Lora, JetBrains_Mono } from 'next/font/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import GoogleOneTap from '@/components/GoogleOneTap';
import Providers from '@/lib/providers';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans' });
const lora = Lora({ subsets: ['latin'], variable: '--font-serif' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export const metadata: Metadata = {
  title: 'Writen | Join the Conversation',
  description: 'The leading space for technical narratives.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <body className={`${plusJakartaSans.variable} ${lora.variable} ${jetbrainsMono.variable} bg-background text-foreground font-body-md min-h-screen selection:bg-primary-container selection:text-on-primary-container transition-colors duration-300`}>
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
