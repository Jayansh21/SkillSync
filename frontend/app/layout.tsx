import './globals.css'

export const metadata = {
  title: 'SkillSync',
  description: 'AI-Powered Resume Analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}
