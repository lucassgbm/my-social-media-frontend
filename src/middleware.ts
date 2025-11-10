import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // console.log('⚡ Middleware rodou em:', req.nextUrl.pathname);

  // const session = req.cookies.get('auth_token')?.value;

  // if (!session) {
  //   return NextResponse.redirect(new URL('/login', req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/social-media/:path*', '/social-media'], // protege apenas /dashboard
};
