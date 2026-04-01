import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CajeroManager from '@/components/cajero/CajeroManager';

export default async function CajeroPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Solo cajero y administrador pueden acceder
  if (session.user.rol !== 'CAJERO' && session.user.rol !== 'ADMINISTRADOR') {
    redirect('/');
  }

  const usuarioId = session.user.id || session.user.email || '';

  // Obtener pedidos listos para cobrar
  const pedidosListos = await prisma.pedido.findMany({
    where: {
      estado: 'LISTO',
    },
    include: {
      mesa: true,
      detalles: {
        include: {
          producto: {
            include: {
              categoria: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: 'asc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <h1 className="text-3xl font-bold">Panel de Caja</h1>
                <p className="text-emerald-100">Gestión de pagos y facturación</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-emerald-100">Cajero</p>
                <p className="font-semibold">{session.user.nombre}</p>
              </div>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/login' });
                }}
              >
                <button
                  type="submit"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CajeroManager 
          pedidos={JSON.parse(JSON.stringify(pedidosListos))} 
          usuarioId={usuarioId}
          usuarioEmail={session.user.email || ''}
        />
      </div>
    </div>
  );
}
