import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'findius – Dein smarter Produktvergleich',
  description:
    'Finde die besten Produkte mit KI-gestützter Analyse. Vergleiche Millionen von Amazon-Produkten intelligent.',
  keywords: ['Produktvergleich', 'Amazon', 'KI', 'Produktsuche', 'Bewertungen'],
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'findius – Dein smarter Produktvergleich',
    description: 'Finde die besten Produkte mit KI-gestützter Analyse.',
    url: 'https://findius.io',
    siteName: 'findius',
    type: 'website',
    locale: 'de_DE',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ThemeToggle />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
