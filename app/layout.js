import './globals.css'

export const metadata = {
  title: 'Mugen Watch Party',
  description: 'Competitive step tracking app with daily team matchups and epic battle arena',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
