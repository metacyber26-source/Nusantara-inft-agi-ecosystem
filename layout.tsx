import "./globals.css"

export const metadata = {
  title: "Nusantara Neo iNFT Forge",
  description: "ICP2E Blitar Raya Community",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Menyisipkan izin khusus Pi Browser langsung ke level HTML Head */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="frame-ancestors 'self' https://*.pinet.com https://sandbox.pinet.com http://sandbox.pinet.com;"
        />
        <meta httpEquiv="X-Frame-Options" content="ALLOW-FROM https://*.pinet.com" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
