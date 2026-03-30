import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import MesasManager from '@/components/admin/mesas/MesasManager';

export default async function MesasPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const mesas = await prisma.mesa.findMany({
    orderBy: {
      numero: 'asc',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h1>
              <p className="text-sm text-gray-600">Configurar mesas y distribución del restaurante</p>
            </div>
            <a
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Volver al Dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MesasManager mesas={JSON.parse(JSON.stringify(mesas))} />
      </main>
    </div>
  );
}
