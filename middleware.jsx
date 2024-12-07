import { NextResponse } from 'next/server';

export async function middleware(req) {
  const tokenCookie = req.cookies.get('firebaseAuthToken');
  const token = tokenCookie?.value;
  const cookieConsent = req.cookies.get('cookieConsent')?.value;
  const url = req.nextUrl.clone();


  // Home without cookies ("/")
  const allowedPaths = ['/', '/favicon.ico', '/robots.txt', '/sitemap.xml','https://www.googletagmanager.com/gtag/js'];
  const isStaticResource =
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static') ||
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|webp|woff2|woff|ttf|otf|eot|mp4|webm)$/i.test(url.pathname);

  if (allowedPaths.includes(url.pathname) || isStaticResource) {
    console.log('Middleware: Recurso permitido directamente');
    return NextResponse.next();
  }

  if (!cookieConsent) {
    console.log('Middleware: No se aceptaron cookies, redirigiendo al home');
    url.pathname = '/';
    url.searchParams.set('cookieWarning', 'true');
    return NextResponse.redirect(url);
  }

  // /admin token 
  if (!token) {
    console.log('Middleware: No hay token, redirigiendo si es ruta /admin');
    if (url.pathname.startsWith('/admin')) {
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (url.pathname.startsWith('/admin')) {
    try {
      console.log('Middleware: Verificando rol de administrador');
      const decodedToken = JSON.parse(token);
      console.log('Token decodificado:', decodedToken);

      const userId = decodedToken?.uid;
      const userRole = decodedToken?.role;

      if (!userId || userRole !== 'admin') {
        console.warn('Middleware: Usuario no tiene permisos de admin');
        url.pathname = '/';
        return NextResponse.redirect(url);
      }

      console.log('Middleware: Usuario tiene rol admin, permitiendo acceso');
    } catch (error) {
      console.error('Middleware: Error al procesar el token:', error);
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }
  }

  console.log('Middleware: Acceso permitido');

  
  return NextResponse.next();
}

// Specific routes
export const config = {
  matcher: ['/((?!api).*)'],
};
