import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MAX CAR</h1>
          <p className="text-gray-600">Sistema de Gestión de Restaurante</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Iniciar Sesión
          </h2>
          <LoginForm />
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Usuario de prueba: admin@maxcar.com / Admin123!
        </p>
      </div>
    </div>
  );
}
