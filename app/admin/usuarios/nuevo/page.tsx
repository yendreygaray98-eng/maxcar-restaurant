import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import UsuarioForm from '@/components/admin/usuarios/UsuarioForm';

export default async function NuevoUsuarioPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nuevo Usuario</h1>
              <p className="text-sm text-gray-600">Agregar un nuevo empleado al sistema</p>
            </div>
            <a
              href="/admin/usuarios"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Volver a Usuarios
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UsuarioForm />
      </main>
    </div>
  );
}
