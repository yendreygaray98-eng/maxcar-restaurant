import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import HistorialVentasManager from '@/components/admin/historial-ventas/HistorialVentasManager';

export default async function HistorialVentasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.rol !== 'ADMINISTRADOR') {
    redirect('/');
  }

  // Obtener todas las ventas completadas (últimos 90 días)
  const ventas = await prisma.pedido.findMany({
    where: {
      estado: 'ENTREGADO',
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
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
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Historial de Ventas</h1>
          <p className="text-gray-600">Consulta, busca y gestiona todas las ventas realizadas</p>
        </div>
        <HistorialVentasManager ventas={JSON.parse(JSON.stringify(ventas))} />
      </div>
    </div>
  );
}
