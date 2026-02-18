import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '../contexts/AppContext'
import Layout from '../components/Layout'

export const metadata: Metadata = {
  title: 'ConsentMD',
  description: 'Healthcare communication platform',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
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
