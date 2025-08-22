// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const publicAuthPages = [
    '/auth/login',
    '/auth/signup',
    '/auth/signup/host',
    '/auth/signup/user',
  ];

  const protectedPaths = [
    { path: '/admin', role: 'admin' },
    { path: '/host', role: 'host' },
    { path: '/user', role: 'user' },
    { path: '/profile', role: ['user', 'admin', 'host'] },
  ];

  const protectedPath = protectedPaths.find((p) => path.startsWith(p.path));

  // ✅ استخدم request.cookies.get()
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  if (publicAuthPages.some((p) => path.startsWith(p))) {
    if (token && userRole) {
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } else if (userRole === 'host') {
        return NextResponse.redirect(new URL('/host/dashboard', request.url));
      } else if (userRole === 'user') {
        return NextResponse.redirect(new URL('/user/dashboard', request.url));
      }
    }
  }

  if (protectedPath) {
    if (!token || !userRole) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const requiredRole = protectedPath.role;
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } else {
      if (userRole !== requiredRole) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}
