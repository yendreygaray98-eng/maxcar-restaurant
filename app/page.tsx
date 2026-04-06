import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  // Redirigir según el rol del usuario
  if (session.user?.rol === 'MESERO') {
    redirect('/mesero');
  }
  
  if (session.user?.rol === 'CHEF') {
    redirect('/cocina');
  }
  
  if (session.user?.rol === 'CAJERO') {
    redirect('/cajero');
  }
  
  if (session.user?.rol === 'DOMICILIARIO') {
    redirect('/domiciliario');
  }
  
  redirect('/admin');
}
