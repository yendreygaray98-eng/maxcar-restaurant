import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DomiciliarioManager from '@/components/domiciliario/DomiciliarioManager';

export default async function DomiciliarioPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Solo domiciliario y administrador pueden acceder
  if (session.user.rol !== 'DOMICILIARIO' && session.user.rol !== 'ADMINISTRADOR') {
    redirect('/');
  }

  const usuarioId = session.user.id || session.user.email || '';

  // Obtener pedidos para domicilio
  const pedidosDisponibles = await prisma.pedido.findMany({
    where: {
      tipoPedido: 'DOMICILIO',
      estado: 'LISTO',
      domiciliarioId: null,
    },
    include: {
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

  // Obtener pedidos asignados al domiciliario
  const pedidosAsignados = await prisma.pedido.findMany({
    where: {
      tipoPedido: 'DOMICILIO',
      domiciliarioId: usuarioId,
      estado: {
        in: ['LISTO', 'EN_CAMINO'],
      },
    },
    include: {
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
      fechaAsignacion: 'asc',
    },
  });

  // Obtener entregas completadas del día
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const entregasCompletadas = await prisma.pedido.findMany({
    where: {
      tipoPedido: 'DOMICILIO',
      domiciliarioId: usuarioId,
      estado: 'ENTREGADO',
      fechaEntrega: {
        gte: hoy,
      },
    },
    include: {
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
      fechaEntrega: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h1 className="text-3xl font-bold">Panel de Domiciliario</h1>
                <p className="text-orange-100">Gestión de entregas a domicilio</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-orange-100">Domiciliario</p>
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
        <DomiciliarioManager
          pedidosDisponibles={JSON.parse(JSON.stringify(pedidosDisponibles))}
          pedidosAsignados={JSON.parse(JSON.stringify(pedidosAsignados))}
          entregasCompletadas={JSON.parse(JSON.stringify(entregasCompletadas))}
          usuarioId={usuarioId}
        />
      </div>
    </div>
  );
}
