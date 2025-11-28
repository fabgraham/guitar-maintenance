import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/hooks/useAppState'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="content pt-12 md:pt-0">
              {children}
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  )
}
