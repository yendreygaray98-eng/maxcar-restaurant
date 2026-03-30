'use client';

import { useState } from 'react';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  stockActual: number | null;
  stockMinimo: number | null;
  precio: number;
}

interface Props {
  producto: Producto;
  onClose: () => void;
  onMovimientoRealizado: (producto: Producto) => void;
}

export default function MovimientoModal({ producto, onClose, onMovimientoRealizado }: Props) {
  const [tipoMovimiento, setTipoMovimiento] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      setError('La cantidad debe ser un número mayor a 0');
      setLoading(false);
      return;
    }

    if (tipoMovimiento === 'SALIDA' && cantidadNum > (producto.stockActual || 0)) {
      setError('No hay suficiente stock disponible');
      setLoading(false);
      return;
    }

    try {
      const nuevoStock = tipoMovimiento === 'ENTRADA' 
        ? (producto.stockActual || 0) + cantidadNum
        : (producto.stockActual || 0) - cantidadNum;

      const response = await fetch(`/api/inventario/${producto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stockActual: nuevoStock,
          tipoMovimiento,
          cantidad: cantidadNum,
          motivo,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al registrar movimiento');
      }

      const productoActualizado = await response.json();
      onMovimientoRealizado(productoActualizado);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const stockResultante = tipoMovimiento === 'ENTRADA'
    ? (producto.stockActual || 0) + (parseInt(cantidad) || 0)
    : (producto.stockActual || 0) - (parseInt(cantidad) || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Movimiento de Inventario</h2>
              <p className="text-sm text-gray-600 mt-1">{producto.nombre}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Stock Actual */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Stock Actual</span>
              <span className="text-2xl font-bold text-gray-900">{producto.stockActual || 0}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">Stock Mínimo</span>
              <span className="text-sm text-gray-600">{producto.stockMinimo || 0}</span>
            </div>
          </div>

          {/* Tipo de Movimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Movimiento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoMovimiento('ENTRADA')}
                className={`p-4 border-2 rounded-lg font-medium transition-all ${
                  tipoMovimiento === 'ENTRADA'
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Entrada
              </button>
              <button
                type="button"
                onClick={() => setTipoMovimiento('SALIDA')}
                className={`p-4 border-2 rounded-lg font-medium transition-all ${
                  tipoMovimiento === 'SALIDA'
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Salida
              </button>
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              required
              placeholder="Ingrese la cantidad"
            />
          </div>

          {/* Stock Resultante */}
          {cantidad && (
            <div className={`rounded-lg p-4 border-2 ${
              stockResultante < 0 
                ? 'bg-red-50 border-red-200' 
                : stockResultante <= (producto.stockMinimo || 0)
                ? 'bg-orange-50 border-orange-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Stock Resultante</span>
                <span className={`text-2xl font-bold ${
                  stockResultante < 0 
                    ? 'text-red-700' 
                    : stockResultante <= (producto.stockMinimo || 0)
                    ? 'text-orange-700'
                    : 'text-green-700'
                }`}>
                  {stockResultante}
                </span>
              </div>
              {stockResultante < 0 && (
                <p className="text-xs text-red-600 mt-2">Stock insuficiente</p>
              )}
              {stockResultante >= 0 && stockResultante <= (producto.stockMinimo || 0) && (
                <p className="text-xs text-orange-600 mt-2">Stock por debajo del mínimo</p>
              )}
            </div>
          )}

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo (opcional)
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Ej: Compra de proveedor, Ajuste de inventario, etc."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || stockResultante < 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
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
