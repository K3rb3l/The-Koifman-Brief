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
  description: 'Clarity in complexity. Geopolitics, FinTech, and real estate analysis by Shahar Koifman.',
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
        {/* CSS-only loading overlay — created outside React's tree to avoid removeChild errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document,o=d.createElement('div');o.id='tkb-preload';o.style.cssText='position:fixed;inset:0;z-index:9999;background:#0A0A08;pointer-events:none';d.body?d.body.prepend(o):d.addEventListener('DOMContentLoaded',function(){d.body.prepend(o)});try{var r=matchMedia('(prefers-reduced-motion:reduce)').matches;var k='tkb-intro-last';var c=6e4*60;var s=Number(localStorage.getItem(k)||0);var n=performance.getEntriesByType('navigation')[0];var h=!n||n.type==='navigate'||n.type==='reload';if(r||!h||(Date.now()-s<c)){o.style.display='none'}else{d.documentElement.style.background='#0A0A08'}}catch(e){o.style.display='none'}})()`,
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
