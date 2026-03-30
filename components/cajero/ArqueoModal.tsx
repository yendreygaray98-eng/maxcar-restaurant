'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  onClose: () => void;
  usuarioId: string;
}

interface Arqueo {
  id: string;
  montoInicial: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasTransfer: number;
  totalEsperado: number;
  montoReal: number | null;
  diferencia: number | null;
  estado: string;
  fechaApertura: string;
  fechaCierre: string | null;
}

export default function ArqueoModal({ onClose, usuarioId }: Props) {
  const router = useRouter();
  const [arqueoActivo, setArqueoActivo] = useState<Arqueo | null>(null);
  const [montoInicial, setMontoInicial] = useState('300000');
  const [montoReal, setMontoReal] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    cargarArqueoActivo();
  }, []);

  const cargarArqueoActivo = async () => {
    try {
      const response = await fetch('/api/arqueo/activo');
      if (response.ok) {
        const data = await response.json();
        setArqueoActivo(data);
      }
    } catch (error) {
      console.error('Error al cargar arqueo:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAbrirCaja = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/arqueo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId,
          montoInicial: parseFloat(montoInicial),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al abrir caja');
      }

      const data = await response.json();
      setArqueoActivo(data);
      router.refresh();
    } catch (error) {
      alert('Error al abrir la caja');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarCaja = async () => {
    if (!arqueoActivo) return;

    const monto = parseFloat(montoReal);
    if (isNaN(monto) || monto < 0) {
      alert('Ingrese un monto válido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/arqueo/${arqueoActivo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          montoReal: monto,
          observaciones,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al cerrar caja');
      }

      onClose();
      router.refresh();
    } catch (error) {
      alert('Error al cerrar la caja');
    } finally {
      setLoading(false);
    }
  };

  const calcularDiferencia = () => {
    if (!arqueoActivo || !montoReal) return 0;
    return parseFloat(montoReal) - arqueoActivo.totalEsperado;
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Arqueo de Caja</h2>
            <p className="text-blue-100">
              {arqueoActivo ? 'Caja Abierta' : 'Abrir Nueva Caja'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!arqueoActivo ? (
            // Abrir Caja
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 font-medium">No hay una caja abierta</p>
                <p className="text-blue-700 text-sm mt-1">
                  Ingresa el monto inicial para abrir la caja
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Inicial (Base)
                </label>
                <input
                  type="number"
                  value={montoInicial}
                  onChange={(e) => setMontoInicial(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="300000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Monto con el que inicias el turno
                </p>
              </div>

              <button
                onClick={handleAbrirCaja}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-4 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all"
              >
                {loading ? 'Abriendo...' : 'Abrir Caja'}
              </button>
            </div>
          ) : (
            // Cerrar Caja
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 font-medium">Caja Abierta</p>
                <p className="text-green-700 text-sm mt-1">
                  Abierta el {new Date(arqueoActivo.fechaApertura).toLocaleString('es-CO')}
                </p>
              </div>

              {/* Resumen de ventas */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-gray-900 mb-3">Resumen del Día</h3>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto Inicial:</span>
                  <span className="font-bold">${arqueoActivo.montoInicial.toLocaleString()}</span>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ventas en Efectivo:</span>
                    <span className="font-medium text-green-600">${arqueoActivo.ventasEfectivo.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ventas con Tarjeta:</span>
                    <span className="font-medium text-blue-600">${arqueoActivo.ventasTarjeta.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ventas por Transferencia:</span>
                    <span className="font-medium text-purple-600">${arqueoActivo.ventasTransfer.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Esperado en Caja:</span>
                    <span className="text-blue-600">${arqueoActivo.totalEsperado.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    (Base + Efectivo recibido)
                  </p>
                </div>
              </div>

              {/* Cierre de caja */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto Real Contado
                  </label>
                  <input
                    type="number"
                    value={montoReal}
                    onChange={(e) => setMontoReal(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Cuenta el dinero físico"
                  />
                </div>

                {montoReal && (
                  <div className={`rounded-lg p-4 border-2 ${
                    calcularDiferencia() === 0 
                      ? 'bg-green-50 border-green-300' 
                      : calcularDiferencia() > 0 
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-red-50 border-red-300'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Diferencia:</span>
                      <span className={`text-2xl font-bold ${
                        calcularDiferencia() === 0 
                          ? 'text-green-600' 
                          : calcularDiferencia() > 0 
                            ? 'text-blue-600'
                            : 'text-red-600'
                      }`}>
                        {calcularDiferencia() > 0 ? '+' : ''}${calcularDiferencia().toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm mt-1">
                      {calcularDiferencia() === 0 && 'Cuadra perfecto'}
                      {calcularDiferencia() > 0 && 'Sobra dinero'}
                      {calcularDiferencia() < 0 && 'Falta dinero'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Notas sobre el cierre de caja..."
                  />
                </div>

                <button
                  onClick={handleCerrarCaja}
                  disabled={loading || !montoReal}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-4 rounded-lg font-bold hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Cerrando...' : 'Cerrar Caja'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
