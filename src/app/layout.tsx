import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LoadingAnimation } from '@/components/LoadingAnimation'
import { BackgroundAnimation } from '@/components/BackgroundAnimation'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'The Koifman Brief',
    template: '%s | The Koifman Brief',
  },
  description: 'Macro forces. Structural shifts. What to do about them.',
  metadataBase: new URL('https://thekoifmanbrief.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'The Koifman Brief',
  },
  twitter: {
    card: 'summary_large_image',
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
        {/* Block flash of content — starts dark until LoadingAnimation hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(!matchMedia('(prefers-reduced-motion:reduce)').matches){document.documentElement.style.background='#0A0A08'}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LoadingAnimation />
          <BackgroundAnimation />
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
