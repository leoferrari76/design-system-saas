import './globals.css'

export const metadata = {
  title: 'Design System SaaS',
  description: 'Gerador automático de Design Systems',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}