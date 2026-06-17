import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'JAROD — Jarod Cowork Dashboard',
  description: "Interface de contrôle locale pour l'agent JAROD — IA sécurisée et persistante.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${jakartaSans.variable} ${jetbrainsMono.variable} dark h-screen overflow-hidden`}
        style={{ fontFamily: 'var(--font-jakarta), system-ui, sans-serif', background: '#050508' }}
      >
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
