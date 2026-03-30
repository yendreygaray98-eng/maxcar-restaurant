import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PedidoForm from '@/components/mesero/PedidoForm';

export default async function MesaPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  if (!session) {
    redirect('/login');
  }

  if (session.user?.rol !== 'MESERO' && session.user?.rol !== 'ADMINISTRADOR') {
    redirect('/login');
  }

  const mesa = await prisma.mesa.findUnique({
    where: { id },
  });

  if (!mesa) {
    redirect('/mesero');
  }

  const productos = await prisma.producto.findMany({
    include: {
      categoria: true,
    },
    orderBy: {
      nombre: 'asc',
    },
  });

  const categorias = await prisma.categoria.findMany({
    orderBy: {
      nombre: 'asc',
    },
  });

  // Buscar pedido activo para esta mesa
  const pedidoActivo = await prisma.pedido.findFirst({
    where: {
      mesaId: id,
      estado: {
        in: ['PENDIENTE', 'EN_PREPARACION'],
      },
    },
    include: {
      detalles: {
        include: {
          producto: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mesa #{mesa.numero}</h1>
              <p className="text-sm text-gray-600">
                {mesa.tipo} - {mesa.capacidad} personas
              </p>
            </div>
            <a
              href="/mesero"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Volver a Mesas
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PedidoForm
          mesa={JSON.parse(JSON.stringify(mesa))}
          productos={JSON.parse(JSON.stringify(productos))}
          categorias={JSON.parse(JSON.stringify(categorias))}
          pedidoActivo={pedidoActivo ? JSON.parse(JSON.stringify(pedidoActivo)) : null}
          usuarioId={session.user?.id || ''}
        />
      </main>
    </div>
  );
}
