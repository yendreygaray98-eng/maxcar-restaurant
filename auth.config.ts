import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const userRole = auth?.user?.rol;
      
      if (isOnLogin) {
        return true; // Permitir acceso a login
      }
      
      // Proteger rutas de admin - solo administradores
      if (nextUrl.pathname.startsWith('/admin')) {
        if (!isLoggedIn) return false;
        if (userRole !== 'ADMINISTRADOR') {
          return Response.redirect(new URL('/mesero', nextUrl));
        }
        return true;
      }
      
      // Proteger rutas de mesero - meseros y administradores
      if (nextUrl.pathname.startsWith('/mesero')) {
        if (!isLoggedIn) return false;
        if (userRole !== 'MESERO' && userRole !== 'ADMINISTRADOR') {
          return Response.redirect(new URL('/admin', nextUrl));
        }
        return true;
      }
      
      // Proteger rutas de cocina - chef y administradores
      if (nextUrl.pathname.startsWith('/cocina')) {
        if (!isLoggedIn) return false;
        if (userRole !== 'CHEF' && userRole !== 'ADMINISTRADOR') {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }
      
      // Proteger rutas de cajero - cajero y administradores
      if (nextUrl.pathname.startsWith('/cajero')) {
        if (!isLoggedIn) return false;
        if (userRole !== 'CAJERO' && userRole !== 'ADMINISTRADOR') {
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }
      
      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
