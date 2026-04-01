'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArqueoModal from './ArqueoModal';

interface Producto {
  id: string;
  nombre: string;
  categoria: {
    nombre: string;
  };
}

interface DetallePedido {
  id: string;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  notas: string | null;
  producto: Producto;
}

interface Mesa {
  numero: number;
  tipo: string;
}

interface Pedido {
  id: string;
  numero: string;
  estado: string;
  createdAt: string;
  subtotal: number;
  cargoVip: number;
  iva: number;
  total: number;
  mesa: Mesa;
  detalles: DetallePedido[];
}

interface Props {
  pedidos: Pedido[];
  usuarioId: string;
}

export default function CajeroManager({ pedidos: pedidosIniciales, usuarioId }: Props) {
  const router = useRouter();
  const [pedidos, setPedidos] = useState(pedidosIniciales);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [metodoPago, setMetodoPago] = useState<string>('EFECTIVO');
  const [montoPagado, setMontoPagado] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mostrarArqueo, setMostrarArqueo] = useState(false);

  const handleCobrar = async () => {
    if (!pedidoSeleccionado) return;

    const monto = parseFloat(montoPagado);
    const total = Number(pedidoSeleccionado.total);

    if (metodoPago === 'EFECTIVO' && monto < total) {
      alert('El monto pagado es insuficiente');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/pedidos/${pedidoSeleccionado.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          estado: 'ENTREGADO',
          metodoPago: metodoPago,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al procesar el pago');
      }

      // Remover de la lista
      setPedidos(pedidos.filter(p => p.id !== pedidoSeleccionado.id));
      setPedidoSeleccionado(null);
      setMontoPagado('');
      setMetodoPago('EFECTIVO');
      router.refresh();
    } catch (error) {
      alert('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const calcularCambio = () => {
    if (!pedidoSeleccionado || !montoPagado) return 0;
    const monto = parseFloat(montoPagado);
    const total = Number(pedidoSeleccionado.total);
    return Math.max(0, monto - total);
  };

  const formatearHora = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Botón de Arqueo */}
      <div className="flex justify-end">
        <button
          onClick={() => setMostrarArqueo(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Arqueo de Caja
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos por Cobrar</p>
              <p className="text-4xl font-bold text-emerald-600 mt-2">{pedidos.length}</p>
            </div>
            <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total a Cobrar</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${pedidos.reduce((sum, p) => sum + Number(p.total), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ${pedidos.length > 0 
                  ? (pedidos.reduce((sum, p) => sum + Number(p.total), 0) / pedidos.length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : 0}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      {pedidos.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay pedidos por cobrar</h3>
          <p className="text-gray-600">Todos los pedidos están pagados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-lg shadow-md border-2 border-emerald-300 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold">Pedido #{pedido.numero}</h3>
                    <p className="text-emerald-100">Mesa #{pedido.mesa.numero}</p>
                    {pedido.mesa.tipo === 'VIP' && (
                      <span className="inline-block mt-1 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-100">Listo desde</p>
                    <p className="text-lg font-bold" suppressHydrationWarning>
                      {formatearHora(pedido.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2 mb-4">
                  {pedido.detalles.map((detalle) => (
                    <div key={detalle.id} className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center font-bold text-emerald-700 text-xs">
                        {detalle.cantidad}
                      </span>
                      <span className="flex-1 text-gray-900">{detalle.producto.nombre}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-1 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${Number(pedido.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm h-5">
                    {Number(pedido.cargoVip) > 0 ? (
                      <>
                        <span className="text-gray-600">Cargo VIP</span>
                        <span className="text-purple-600">${Number(pedido.cargoVip).toLocaleString()}</span>
                      </>
                    ) : (
                      <span></span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IVA</span>
                    <span>${Number(pedido.iva).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-emerald-600">${Number(pedido.total).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setPedidoSeleccionado(pedido);
                    setMontoPagado(pedido.total.toString());
                  }}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 px-4 rounded-lg font-bold hover:from-emerald-700 hover:to-green-700 transition-all"
                >
                  Cobrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de pago */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6">
              <h2 className="text-2xl font-bold">Procesar Pago</h2>
              <p className="text-emerald-100">Pedido #{pedidoSeleccionado.numero} - Mesa #{pedidoSeleccionado.mesa.numero}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total a pagar:</span>
                  <span className="text-3xl font-bold text-emerald-600">
                    ${Number(pedidoSeleccionado.total).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setMetodoPago('EFECTIVO')}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      metodoPago === 'EFECTIVO'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Efectivo
                  </button>
                  <button
                    onClick={() => {
                      setMetodoPago('TARJETA');
                      setMontoPagado(pedidoSeleccionado.total.toString());
                    }}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      metodoPago === 'TARJETA'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tarjeta
                  </button>
                  <button
                    onClick={() => {
                      setMetodoPago('TRANSFERENCIA');
                      setMontoPagado(pedidoSeleccionado.total.toString());
                    }}
                    className={`py-3 px-4 rounded-lg font-medium transition-all ${
                      metodoPago === 'TRANSFERENCIA'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Transfer.
                  </button>
                </div>
              </div>

              {metodoPago === 'EFECTIVO' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monto Recibido
                    </label>
                    <input
                      type="number"
                      value={montoPagado}
                      onChange={(e) => setMontoPagado(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                      placeholder="0"
                    />
                  </div>

                  {montoPagado && parseFloat(montoPagado) >= Number(pedidoSeleccionado.total) && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 font-medium">Cambio:</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${calcularCambio().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setPedidoSeleccionado(null);
                    setMontoPagado('');
                    setMetodoPago('EFECTIVO');
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCobrar}
                  disabled={loading || (metodoPago === 'EFECTIVO' && parseFloat(montoPagado) < Number(pedidoSeleccionado.total))}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Arqueo */}
      {mostrarArqueo && (
        <ArqueoModal 
          onClose={() => setMostrarArqueo(false)}
          usuarioId={usuarioId}
        />
      )}
    </div>
  );
}
