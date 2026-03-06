import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LoadingAnimation } from '@/components/LoadingAnimation'
import { BackgroundAnimation } from '@/components/BackgroundAnimation'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { AuthProvider } from '@/contexts/AuthContext'
import { GlobalCursorSpotlight } from '@/components/CursorSpotlight'
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
        <GoogleAnalytics />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <LoadingAnimation />
            <BackgroundAnimation />
            <GlobalCursorSpotlight />
            <Header />
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
