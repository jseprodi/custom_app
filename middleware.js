// Temporarily disabled middleware for debugging
export default function middleware(request) {
  // Just pass through all requests for now
  return new Response();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 