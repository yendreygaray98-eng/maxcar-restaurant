import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ConfiguracionForm from '@/components/admin/configuracion/ConfiguracionForm';

export default async function ConfiguracionPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.rol !== 'ADMINISTRADOR') {
    redirect('/');
  }

  // Obtener configuración actual
  const config = await prisma.configuracionRestaurante.findFirst();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <a
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </a>
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Restaurante</h1>
          <p className="text-gray-600">Administra la información que aparece en las facturas</p>
        </div>
        <ConfiguracionForm config={config ? JSON.parse(JSON.stringify(config)) : null} />
      </div>
    </div>
  );
}
