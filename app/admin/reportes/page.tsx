import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ReportesManager from '@/components/admin/reportes/ReportesManager';

export default async function ReportesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.rol !== 'ADMINISTRADOR') {
    redirect('/');
  }

  // Obtener datos para reportes
  const [pedidos, arqueos, usuarios] = await Promise.all([
    // Todos los pedidos entregados (últimos 90 días para no sobrecargar)
    prisma.pedido.findMany({
      where: {
        estado: 'ENTREGADO',
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 días
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
    }),
    // Arqueos de caja
    prisma.arqueo.findMany({
      where: {
        estado: 'CERRADO',
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    // Usuarios (meseros)
    prisma.usuario.findMany({
      where: {
        rol: 'MESERO',
        estado: 'ACTIVO',
      },
      select: {
        id: true,
        nombre: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600">Análisis de ventas y rendimiento del restaurante</p>
        </div>
        <ReportesManager 
          pedidos={JSON.parse(JSON.stringify(pedidos))}
          arqueos={JSON.parse(JSON.stringify(arqueos))}
          usuarios={JSON.parse(JSON.stringify(usuarios))}
        />
      </div>
    </div>
  );
}
