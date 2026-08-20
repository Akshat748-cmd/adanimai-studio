import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SessionWrapper from '@/components/SessionWrapper';
import { ThemeProvider } from '@/components/ThemeProvider';

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const displayFont = Fraunces({
  subsets: ['latin'],
  weight: ['600', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AdAnimAI — AI Animated Video Ad Studio for Businesses',
  description:
    'Turn any website URL or business description into high-converting animated commercial video ads with continuous-motion presenters and verbatim multi-language speech.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${sansFont.variable} ${displayFont.variable}`}>
      <body className="bg-canvas text-text-primary min-h-screen flex flex-col antialiased selection:bg-accent selection:text-white font-sans">
        <ThemeProvider>
          <SessionWrapper>
            <Navbar />
            <main className="flex-1 flex flex-col relative">{children}</main>
            <Footer />
          </SessionWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
