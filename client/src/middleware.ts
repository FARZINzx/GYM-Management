import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";


// List of public paths that don't require authentication
const publicPaths = ['/login'];

export async function middleware(request: NextRequest) {
     const { pathname } = request.nextUrl;
     const cookieStore = await cookies()

     // Check if the path is public
     const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

     // Get the token from cookies
     const token = cookieStore.get('token')?.value;

     // If it's a public path and user is already logged in, redirect to login
     if (isPublicPath && token) {
          return NextResponse.redirect(new URL('/', request.url));
     }

     // If it's a protected path and no token exists, redirect to login
     if (!isPublicPath && !token) {
          return NextResponse.redirect(new URL('/login', request.url));
     }

     return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
     matcher: [
          /*
           * Match all request paths except for the ones starting with:
           * - api (API routes)
           * - _next/static (static files)
           * - _next/image (image optimization files)
           * - favicon.ico (favicon file)
           * - public folder
           */
          '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
     ],
}; 