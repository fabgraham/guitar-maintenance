import { Space_Grotesk, Space_Mono } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/hooks/useAppState'
import { Navigation } from '@/components/Navigation'
import { ToastProvider } from '@/contexts/ToastContext'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable} font-sans`}>
        <ToastProvider>
          <AppProvider>
            <Navigation />
            <div className="content">
              {children}
            </div>
          </AppProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
