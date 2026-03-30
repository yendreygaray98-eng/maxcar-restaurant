import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CocinaManager from '@/components/cocina/CocinaManager';

export default async function CocinaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Solo chef puede acceder
  if (session.user.rol !== 'CHEF' && session.user.rol !== 'ADMINISTRADOR') {
    redirect('/');
  }

  // Obtener pedidos pendientes y en preparación
  const pedidos = await prisma.pedido.findMany({
    where: {
      estado: {
        in: ['PENDIENTE', 'EN_PREPARACION'],
      },
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
      createdAt: 'asc',
    },
  });

  // Obtener pedidos completados del día
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const pedidosCompletados = await prisma.pedido.findMany({
    where: {
      estado: {
        in: ['LISTO', 'ENTREGADO'],
      },
      updatedAt: {
        gte: hoy,
      },
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
      updatedAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <div>
                <h1 className="text-3xl font-bold">Panel de Cocina</h1>
                <p className="text-orange-100">Gestión de comandas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-orange-100">Chef</p>
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
        <CocinaManager 
          pedidos={JSON.parse(JSON.stringify(pedidos))} 
          pedidosCompletados={JSON.parse(JSON.stringify(pedidosCompletados))}
        />
      </div>
    </div>
  );
}
