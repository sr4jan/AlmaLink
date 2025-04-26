import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAlumniRoute = req.nextUrl.pathname.startsWith('/dashboard/alumni');
     // Protect superadmin routes
     if (path.startsWith("/dashboard/superadmin")) {
      if (token?.role !== "superadmin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    
    // Protect admin routes

    if (path.startsWith("/dashboard/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
    if (path.startsWith('/dashboard/alumni') && token?.role !== 'alumni') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    // If trying to access alumni routes without being an alumni
    if (isAlumniRoute && token?.role !== 'alumni') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (
      (path.startsWith('/jobportal/post') ||
       path.startsWith('/events/create') ||
       path.startsWith('/livesessions/host') ||
       path.startsWith('/donationportal')) &&
      token?.role !== 'alumni'
    ) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/admin:path*',
    '/jobportal/post',
    '/events/create',
    '/livesessions/host',
    '/donationportal',
    '/connections',
  ],
};