'use client';

import { useState, useEffect } from 'react';

interface Mesa {
  id: string;
  numero: number;
  tipo: string;
  capacidad: number;
  estado: string;
}

interface Props {
  mesa?: Mesa | null;
  onClose: () => void;
  onMesaCreada: (mesa: any) => void;
  onMesaActualizada: (mesa: any) => void;
}

export default function MesaFormModal({ mesa, onClose, onMesaCreada, onMesaActualizada }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [numero, setNumero] = useState('');
  const [tipo, setTipo] = useState('REGULAR');
  const [capacidad, setCapacidad] = useState('4');
  const [estado, setEstado] = useState('LIBRE');

  const esEdicion = !!mesa;

  useEffect(() => {
    if (mesa) {
      setNumero(mesa.numero.toString());
      setTipo(mesa.tipo);
      setCapacidad(mesa.capacidad.toString());
      setEstado(mesa.estado);
    } else {
      obtenerSiguienteNumero();
    }
  }, [mesa]);

  const obtenerSiguienteNumero = async () => {
    try {
      const response = await fetch('/api/mesas/siguiente-numero');
      const data = await response.json();
      setNumero(data.numero.toString());
    } catch (err) {
      console.error('Error obteniendo siguiente número:', err);
      setNumero('1');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = esEdicion ? `/api/mesas/${mesa.id}` : '/api/mesas';
      const method = esEdicion ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numero: parseInt(numero),
          tipo,
          capacidad: parseInt(capacidad),
          estado: esEdicion ? estado : 'LIBRE',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Error al ${esEdicion ? 'actualizar' : 'crear'} mesa`);
      }

      const mesaResponse = await response.json();
      
      if (esEdicion) {
        onMesaActualizada(mesaResponse);
      } else {
        onMesaCreada(mesaResponse);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {esEdicion ? 'Editar Mesa' : 'Nueva Mesa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Mesa
            </label>
            <input
              type="number"
              value={numero}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              {esEdicion ? 'El número de mesa no se puede modificar' : 'Número asignado automáticamente'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Mesa
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipo('REGULAR')}
                className={`p-3 border-2 rounded-lg font-medium transition-all ${
                  tipo === 'REGULAR'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Regular
              </button>
              <button
                type="button"
                onClick={() => setTipo('VIP')}
                className={`p-3 border-2 rounded-lg font-medium transition-all ${
                  tipo === 'VIP'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                VIP
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidad (personas)
            </label>
            <input
              type="number"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="20"
              required
            />
          </div>

          {esEdicion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEstado('LIBRE')}
                  className={`p-2 border-2 rounded-lg text-sm font-medium transition-all ${
                    estado === 'LIBRE'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Libre
                </button>
                <button
                  type="button"
                  onClick={() => setEstado('OCUPADA')}
                  className={`p-2 border-2 rounded-lg text-sm font-medium transition-all ${
                    estado === 'OCUPADA'
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ocupada
                </button>
                <button
                  type="button"
                  onClick={() => setEstado('RESERVADA')}
                  className={`p-2 border-2 rounded-lg text-sm font-medium transition-all ${
                    estado === 'RESERVADA'
                      ? 'border-yellow-600 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reservada
                </button>
                <button
                  type="button"
                  onClick={() => setEstado('MANTENIMIENTO')}
                  className={`p-2 border-2 rounded-lg text-sm font-medium transition-all ${
                    estado === 'MANTENIMIENTO'
                      ? 'border-gray-600 bg-gray-50 text-gray-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Mantenimiento
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (esEdicion ? 'Actualizando...' : 'Creando...') : (esEdicion ? 'Actualizar Mesa' : 'Crear Mesa')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
