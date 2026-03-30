import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import VentasManager from '@/components/admin/ventas/VentasManager';

export default async function VentasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.rol !== 'ADMINISTRADOR') {
    redirect('/');
  }

  // Obtener todos los pedidos del día
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const pedidos = await prisma.pedido.findMany({
    where: {
      createdAt: {
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
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Ventas del Día</h1>
          <p className="text-gray-600">Historial y reportes de ventas</p>
        </div>
        <VentasManager pedidos={JSON.parse(JSON.stringify(pedidos))} />
      </div>
    </div>
  );
}
