import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductoForm from '@/components/admin/productos/ProductoForm';

export default async function NuevoProductoPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const categorias = await prisma.categoria.findMany({
    orderBy: {
      nombre: 'asc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nuevo Producto</h1>
              <p className="text-sm text-gray-600">Agregar un nuevo producto al menú</p>
            </div>
            <a
              href="/admin/productos"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Volver a Productos
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductoForm categorias={JSON.parse(JSON.stringify(categorias))} />
      </main>
    </div>
  );
}
