import { auth } from '@/lib/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL('/login', req.url))
  }

  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL('/todos', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
