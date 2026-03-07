import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LoadingAnimation } from '@/components/LoadingAnimation'
import { BackgroundAnimation } from '@/components/BackgroundAnimation'
import { GlobalCursorSpotlight } from '@/components/CursorSpotlight'
import { ScrollToTop } from '@/components/ScrollToTop'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'The Koifman Brief',
    template: '%s | The Koifman Brief',
  },
  description: 'Clarity in complexity. Geopolitics, FinTech, and real estate analysis by Shahar Koifman.',
  metadataBase: new URL('https://thekoifmanbrief.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'The Koifman Brief',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Libre+Franklin:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ScrollToTop />
          <LoadingAnimation />
          <BackgroundAnimation />
          <GlobalCursorSpotlight />
          <Header />
          <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
