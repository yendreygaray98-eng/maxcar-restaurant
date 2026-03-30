import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import MesasGrid from '@/components/mesero/MesasGrid';

export default async function MeseroPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Solo meseros y administradores pueden acceder
  if (session.user?.rol !== 'MESERO' && session.user?.rol !== 'ADMINISTRADOR') {
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
              <h1 className="text-2xl font-bold text-gray-900">Panel de Mesero</h1>
              <p className="text-sm text-gray-600">Gestión de mesas y pedidos</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-600">{session.user?.rol}</p>
              </div>
              <form action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MesasGrid mesas={JSON.parse(JSON.stringify(mesas))} />
      </main>
    </div>
  );
}
