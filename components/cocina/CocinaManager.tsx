'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationSound } from '@/lib/useNotificationSound';

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
  updatedAt: string;
  mesa: Mesa;
  detalles: DetallePedido[];
}

interface Props {
  pedidos: Pedido[];
  pedidosCompletados: Pedido[];
}

export default function CocinaManager({ pedidos: pedidosIniciales, pedidosCompletados }: Props) {
  const router = useRouter();
  const [pedidos, setPedidos] = useState(pedidosIniciales);
  const [loading, setLoading] = useState<string | null>(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const { checkForNewItems } = useNotificationSound();

  useEffect(() => {
    // Actualizar pedidos cuando cambien los props
    setPedidos(pedidosIniciales);
    setUltimaActualizacion(new Date());
    
    // Detectar nuevas órdenes y reproducir sonido
    const pedidosPendientes = pedidosIniciales.filter(p => p.estado === 'PENDIENTE' || p.estado === 'EN_PREPARACION');
    checkForNewItems(pedidosPendientes.length, 'nueva-orden');
  }, [pedidosIniciales, checkForNewItems]);

  useEffect(() => {
    // Auto-refresh cada 5 segundos
    const interval = setInterval(() => {
      setActualizando(true);
      router.refresh();
      setTimeout(() => setActualizando(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const handleCambiarEstado = async (pedidoId: string, nuevoEstado: string) => {
    setLoading(pedidoId);
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar pedido');
      }

      // Actualizar localmente
      setPedidos(pedidos.filter(p => p.id !== pedidoId));
      router.refresh();
    } catch (error) {
      alert('Error al cambiar el estado del pedido');
    } finally {
      setLoading(null);
    }
  };

  const pedidosPendientes = pedidos.filter(p => p.estado === 'PENDIENTE');
  const pedidosEnPreparacion = pedidos.filter(p => p.estado === 'EN_PREPARACION');

  const getTiempoTranscurrido = (fecha: string) => {
    const ahora = new Date();
    const creado = new Date(fecha);
    const diff = Math.floor((ahora.getTime() - creado.getTime()) / 1000 / 60);
    return diff;
  };

  const getTiempoColor = (minutos: number) => {
    if (minutos < 10) return 'text-green-600';
    if (minutos < 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatearHora = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Indicador de sincronización */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {actualizando ? (
            <>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Actualizando...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Última actualización: {ultimaActualizacion.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </>
          )}
        </div>
        <span className="text-xs text-gray-500">Auto-actualización cada 5 segundos</span>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos Pendientes</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">{pedidosPendientes.length}</p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Preparación</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{pedidosEnPreparacion.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completados Hoy</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{pedidosCompletados.length}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <button
            onClick={() => setMostrarHistorial(true)}
            className="w-full h-full flex items-center justify-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-left">
              <p className="text-sm font-medium">Ver Historial</p>
              <p className="text-xs text-gray-500">del día</p>
            </div>
          </button>
        </div>
      </div>

      {/* Pedidos Pendientes */}
      {pedidosPendientes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
            Pedidos Nuevos
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pedidosPendientes.map((pedido) => {
              const minutos = getTiempoTranscurrido(pedido.createdAt);
              return (
                <div key={pedido.id} className="bg-white rounded-lg shadow-md border-2 border-orange-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold">Pedido #{pedido.numero}</h3>
                        <p className="text-orange-100">Mesa #{pedido.mesa.numero}</p>
                        {pedido.mesa.tipo === 'VIP' && (
                          <span className="inline-block mt-1 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getTiempoColor(minutos)}`}>
                          {minutos} min
                        </p>
                        <p className="text-xs text-orange-100">esperando</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {pedido.detalles.map((detalle) => (
                      <div key={detalle.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-orange-600">{detalle.cantidad}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{detalle.producto.nombre}</h4>
                          <p className="text-xs text-gray-500">{detalle.producto.categoria.nombre}</p>
                          {detalle.notas && (
                            <p className="text-sm text-blue-600 mt-1 italic">📝 {detalle.notas}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => handleCambiarEstado(pedido.id, 'EN_PREPARACION')}
                      disabled={loading === pedido.id}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all"
                    >
                      {loading === pedido.id ? 'Procesando...' : 'Iniciar Preparación'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pedidos en Preparación */}
      {pedidosEnPreparacion.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            En Preparación
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pedidosEnPreparacion.map((pedido) => {
              const minutos = getTiempoTranscurrido(pedido.createdAt);
              return (
                <div key={pedido.id} className="bg-white rounded-lg shadow-md border-2 border-blue-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold">Pedido #{pedido.numero}</h3>
                        <p className="text-blue-100">Mesa #{pedido.mesa.numero}</p>
                        {pedido.mesa.tipo === 'VIP' && (
                          <span className="inline-block mt-1 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                            VIP
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getTiempoColor(minutos)}`}>
                          {minutos} min
                        </p>
                        <p className="text-xs text-blue-100">en cocina</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {pedido.detalles.map((detalle) => (
                      <div key={detalle.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-blue-600">{detalle.cantidad}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{detalle.producto.nombre}</h4>
                          <p className="text-xs text-gray-500">{detalle.producto.categoria.nombre}</p>
                          {detalle.notas && (
                            <p className="text-sm text-blue-600 mt-1 italic">📝 {detalle.notas}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <button
                      onClick={() => handleCambiarEstado(pedido.id, 'LISTO')}
                      disabled={loading === pedido.id}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-bold hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all"
                    >
                      {loading === pedido.id ? 'Procesando...' : 'Marcar como Listo'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pedidos.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay pedidos pendientes</h3>
          <p className="text-gray-600">Todos los pedidos están completados</p>
        </div>
      )}

      {/* Modal de Historial */}
      {mostrarHistorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Historial del Día</h2>
                <p className="text-green-100">Pedidos completados</p>
              </div>
              <button
                onClick={() => setMostrarHistorial(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {pedidosCompletados.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">No hay pedidos completados hoy</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pedidosCompletados.map((pedido) => (
                    <div key={pedido.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-white p-4 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Pedido #{pedido.numero}</h3>
                            <p className="text-sm text-gray-600">
                              Mesa #{pedido.mesa.numero} {pedido.mesa.tipo === 'VIP' && '⭐'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              {formatearHora(pedido.updatedAt)}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              pedido.estado === 'LISTO' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {pedido.estado}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        {pedido.detalles.map((detalle) => (
                          <div key={detalle.id} className="flex items-center gap-3 text-sm">
                            <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center font-bold text-green-700">
                              {detalle.cantidad}
                            </span>
                            <span className="flex-1 text-gray-900">{detalle.producto.nombre}</span>
                            <span className="text-xs text-gray-500">{detalle.producto.categoria.nombre}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
