import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  // Create a Supabase client for auth
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // Check auth session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if the route is an admin route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  if (isAdminRoute && !session) {
    // If no session and trying to access admin route, redirect to home
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

// Match all admin routes
export const config = {
  matcher: ['/admin/:path*']
}; 