import type { Metadata } from 'next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ThemeColor from '@/components/layout/ThemeColor'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/hooks/useTheme'
import '@fontsource/inter'
import './globals.css'

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_SITE_NAME} - ${process.env.NEXT_PUBLIC_SITE_DESCRIPTION}`,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
}

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <ThemeColor />
          {children}
          <Toaster />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}
