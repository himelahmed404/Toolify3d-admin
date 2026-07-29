import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === '/login';

  const session = await auth.api.getSession({ headers: request.headers });
  const isAdmin = session?.user?.role === 'admin';

  if (isAdmin) {
    if (isLoginRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (isLoginRoute) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
