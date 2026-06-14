import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Paksa server menyisipkan izin khusus untuk Pi Browser
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.pinet.com https://sandbox.pinet.com http://sandbox.pinet.com;"
  )
  
  response.headers.set('X-Frame-Options', 'ALLOW-FROM https://*.pinet.com')

  return response
}

// Aturan agar hanya berjalan di halaman utama & app router
export const config = {
  matcher: '/:path*',
}

