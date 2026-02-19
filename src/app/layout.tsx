import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppProvider } from '../contexts/AppContext'
import Layout from '../components/Layout'

export const metadata: Metadata = {
  title: 'ConsentMD',
  description: 'Healthcare communication platform',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <Layout>
            {children}
          </Layout>
        </AppProvider>
      </body>
    </html>
  )
}
