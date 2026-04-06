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
  precioUnit: number;
  subtotal: number;
  notas: string | null;
  producto: Producto;
}

interface Pedido {
  id: string;
  numero: string;
  estado: string;
  direccionEntrega: string | null;
  telefonoCliente: string | null;
  clienteNombre: string | null;
  createdAt: string;
  fechaAsignacion: string | null;
  fechaEntrega: string | null;
  subtotal: number;
  iva: number;
  total: number;
  detalles: DetallePedido[];
}

interface Props {
  pedidosDisponibles: Pedido[];
  pedidosAsignados: Pedido[];
  entregasCompletadas: Pedido[];
  usuarioId: string;
}

export default function DomiciliarioManager({
  pedidosDisponibles: disponiblesIniciales,
  pedidosAsignados: asignadosIniciales,
  entregasCompletadas,
  usuarioId,
}: Props) {
  const router = useRouter();
  const [disponibles, setDisponibles] = useState(disponiblesIniciales);
  const [asignados, setAsignados] = useState(asignadosIniciales);
  const [loading, setLoading] = useState<string | null>(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const { checkForNewItems } = useNotificationSound();

  useEffect(() => {
    setDisponibles(disponiblesIniciales);
    setAsignados(asignadosIniciales);
    setUltimaActualizacion(new Date());
    
    // Notificar nuevos pedidos disponibles
    checkForNewItems(disponiblesIniciales.length, 'orden-lista');
  }, [disponiblesIniciales, asignadosIniciales, checkForNewItems]);

  useEffect(() => {
    // Auto-refresh cada 5 segundos
    const interval = setInterval(() => {
      setActualizando(true);
      router.refresh();
      setTimeout(() => setActualizando(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const handleTomarPedido = async (pedidoId: string) => {
    setLoading(pedidoId);
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domiciliarioId: usuarioId,
          fechaAsignacion: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al tomar pedido');
      }

      router.refresh();
    } catch (error) {
      alert('Error al tomar el pedido');
    } finally {
      setLoading(null);
    }
  };

  const handleMarcarEnCamino = async (pedidoId: string) => {
    setLoading(pedidoId);
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'EN_CAMINO',
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado');
      }

      router.refresh();
    } catch (error) {
      alert('Error al marcar como en camino');
    } finally {
      setLoading(null);
    }
  };

  const handleMarcarEntregado = async (pedidoId: string) => {
    setLoading(pedidoId);
    try {
      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'ENTREGADO',
          fechaEntrega: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al marcar como entregado');
      }

      router.refresh();
    } catch (error) {
      alert('Error al marcar como entregado');
    } finally {
      setLoading(null);
    }
  };

  const formatearHora = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  const getTiempoTranscurrido = (fecha: string) => {
    const ahora = new Date();
    const creado = new Date(fecha);
    const diff = Math.floor((ahora.getTime() - creado.getTime()) / 1000 / 60);
    return diff;
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
              <p className="text-sm font-medium text-gray-600">Disponibles</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">{disponibles.length}</p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mis Entregas</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">{asignados.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Entregadas Hoy</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{entregasCompletadas.length}</p>
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
            className="w-full h-full flex items-center justify-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
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

      {/* Pedidos Disponibles */}
      {disponibles.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></span>
            Pedidos Disponibles
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {disponibles.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-lg shadow-md border-2 border-orange-300 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold">Pedido #{pedido.numero}</h3>
                      <p className="text-orange-100">{pedido.clienteNombre || 'Cliente'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{getTiempoTranscurrido(pedido.createdAt)} min</p>
                      <p className="text-xs text-orange-100">esperando</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">📍 Dirección:</p>
                    <p className="text-gray-900">{pedido.direccionEntrega || 'No especificada'}</p>
                    {pedido.telefonoCliente && (
                      <>
                        <p className="text-sm font-medium text-gray-700 mt-2 mb-1">📞 Teléfono:</p>
                        <p className="text-gray-900">{pedido.telefonoCliente}</p>
                      </>
                    )}
                  </div>

                  {pedido.detalles.map((detalle) => (
                    <div key={detalle.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-orange-600">{detalle.cantidad}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{detalle.producto.nombre}</h4>
                        <p className="text-xs text-gray-500">{detalle.producto.categoria.nombre}</p>
                      </div>
                    </div>
                  ))}

                  <div className="bg-gray-50 rounded-lg p-3 border-t border-gray-200">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-orange-600">${Number(pedido.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => handleTomarPedido(pedido.id)}
                    disabled={loading === pedido.id}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-bold hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition-all"
                  >
                    {loading === pedido.id ? 'Tomando...' : 'Tomar Pedido'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mis Entregas */}
      {asignados.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
            Mis Entregas
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {asignados.map((pedido) => (
              <div key={pedido.id} className="bg-white rounded-lg shadow-md border-2 border-blue-300 overflow-hidden">
                <div className={`text-white p-4 ${
                  pedido.estado === 'EN_CAMINO' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold">Pedido #{pedido.numero}</h3>
                      <p className={pedido.estado === 'EN_CAMINO' ? 'text-blue-100' : 'text-green-100'}>
                        {pedido.clienteNombre || 'Cliente'}
                      </p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                        pedido.estado === 'EN_CAMINO' 
                          ? 'bg-blue-700 text-white' 
                          : 'bg-green-700 text-white'
                      }`}>
                        {pedido.estado === 'EN_CAMINO' ? '🚗 En Camino' : '📦 Listo para Entregar'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {getTiempoTranscurrido(pedido.fechaAsignacion || pedido.createdAt)} min
                      </p>
                      <p className="text-xs text-blue-100">desde asignación</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">📍 Dirección:</p>
                    <p className="text-gray-900 font-semibold">{pedido.direccionEntrega || 'No especificada'}</p>
                    {pedido.telefonoCliente && (
                      <>
                        <p className="text-sm font-medium text-gray-700 mt-2 mb-1">📞 Teléfono:</p>
                        <a href={`tel:${pedido.telefonoCliente}`} className="text-blue-600 font-semibold hover:underline">
                          {pedido.telefonoCliente}
                        </a>
                      </>
                    )}
                  </div>

                  {pedido.detalles.map((detalle) => (
                    <div key={detalle.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-blue-600">{detalle.cantidad}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{detalle.producto.nombre}</h4>
                        <p className="text-xs text-gray-500">{detalle.producto.categoria.nombre}</p>
                      </div>
                    </div>
                  ))}

                  <div className="bg-gray-50 rounded-lg p-3 border-t border-gray-200">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total a Cobrar</span>
                      <span className="text-blue-600">${Number(pedido.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  {pedido.estado === 'LISTO' ? (
                    <button
                      onClick={() => handleMarcarEnCamino(pedido.id)}
                      disabled={loading === pedido.id}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all"
                    >
                      {loading === pedido.id ? 'Procesando...' : '🚗 Salir a Entregar'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarcarEntregado(pedido.id)}
                      disabled={loading === pedido.id}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-bold hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all"
                    >
                      {loading === pedido.id ? 'Procesando...' : '✓ Marcar como Entregado'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {disponibles.length === 0 && asignados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay pedidos pendientes</h3>
          <p className="text-gray-600">Todos los pedidos están entregados</p>
        </div>
      )}

      {/* Modal de Historial */}
      {mostrarHistorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Entregas del Día</h2>
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
              {entregasCompletadas.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600">No hay entregas completadas hoy</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entregasCompletadas.map((pedido) => (
                    <div key={pedido.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-white p-4 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Pedido #{pedido.numero}</h3>
                            <p className="text-sm text-gray-600">{pedido.clienteNombre || 'Cliente'}</p>
                            <p className="text-sm text-gray-600">{pedido.direccionEntrega}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              {formatearHora(pedido.fechaEntrega || pedido.createdAt)}
                            </p>
                            <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                              ENTREGADO
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
                            <span className="font-medium text-gray-900">${Number(detalle.subtotal).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="font-bold text-gray-900">Total</span>
                          <span className="text-lg font-bold text-green-600">${Number(pedido.total).toLocaleString()}</span>
                        </div>
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
