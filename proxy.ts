import { auth } from '@/lib/auth'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const pathname = req.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')

  if (!isLoggedIn && !isAuthPage) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return Response.redirect(loginUrl)
  }

  if (isLoggedIn && isAuthPage) {
    const todosUrl = req.nextUrl.clone()
    todosUrl.pathname = '/todos'
    return Response.redirect(todosUrl)
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
