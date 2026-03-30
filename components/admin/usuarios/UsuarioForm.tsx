'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UsuarioForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('');
  const [estado, setEstado] = useState('ACTIVO');

  const roles = [
    { value: 'ADMINISTRADOR', label: 'Administrador', description: 'Acceso total al sistema' },
    { value: 'MESERO', label: 'Mesero', description: 'Gestión de pedidos y mesas' },
    { value: 'CHEF', label: 'Chef', description: 'Visualización y preparación de pedidos' },
    { value: 'CAJERO', label: 'Cajero', description: 'Gestión de pagos y facturación' },
    { value: 'RECEPCIONISTA', label: 'Recepcionista', description: 'Gestión de reservas' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          nombre,
          password,
          rol,
          estado,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear usuario');
      }

      router.push('/admin/usuarios');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre Completo
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: Juan Pérez"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="usuario@maxcar.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Mínimo 8 caracteres"
          minLength={8}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          La contraseña debe tener al menos 8 caracteres
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rol del Usuario
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRol(r.value)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                rol === r.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{r.label}</div>
              <div className="text-xs text-gray-500 mt-1">{r.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setEstado('ACTIVO')}
            className={`flex-1 p-3 border-2 rounded-lg font-medium transition-all ${
              estado === 'ACTIVO'
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            Activo
          </button>
          <button
            type="button"
            onClick={() => setEstado('INACTIVO')}
            className={`flex-1 p-3 border-2 rounded-lg font-medium transition-all ${
              estado === 'INACTIVO'
                ? 'border-red-600 bg-red-50 text-red-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            Inactivo
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading || !rol}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creando...' : 'Crear Usuario'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
