import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Task Planner',
  description: 'Intelligent task decomposition and project planning powered by AI',
  keywords: ['AI', 'task planner', 'project management', 'task decomposition'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-[#0c0a1d] to-[#1a0a2e] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
