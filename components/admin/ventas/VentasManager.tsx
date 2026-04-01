'use client';

import { useState } from 'react';

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
}

export default function VentasManager({ pedidos }: Props) {
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  const pedidosFiltrados = pedidos.filter(p => 
    !filtroEstado || p.estado === filtroEstado
  );

  const calcularEstadisticas = () => {
    const completados = pedidos.filter(p => p.estado === 'ENTREGADO');
    const totalVentas = completados.reduce((sum, p) => sum + Number(p.total), 0);
    const totalPedidos = completados.length;
    const promedioVenta = totalPedidos > 0 ? totalVentas / totalPedidos : 0;
    
    return {
      totalVentas,
      totalPedidos,
      promedioVenta,
      pendientes: pedidos.filter(p => p.estado === 'PENDIENTE').length,
      enPreparacion: pedidos.filter(p => p.estado === 'EN_PREPARACION').length,
      listos: pedidos.filter(p => p.estado === 'LISTO').length,
      cancelados: pedidos.filter(p => p.estado === 'CANCELADO').length,
    };
  };

  const stats = calcularEstadisticas();

  const formatearHora = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'bg-orange-100 text-orange-800';
      case 'EN_PREPARACION':
        return 'bg-blue-100 text-blue-800';
      case 'LISTO':
        return 'bg-green-100 text-green-800';
      case 'ENTREGADO':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Botón de regreso */}
      <div>
        <a
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Dashboard
        </a>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ventas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${stats.totalVentas.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos Completados</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalPedidos}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Promedio por Venta</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                ${stats.promedioVenta.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos Cancelados</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancelados}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PREPARACION">En Preparación</option>
            <option value="LISTO">Listo</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
          <span className="text-sm text-gray-600">
            {pedidosFiltrados.length} pedido(s)
          </span>
        </div>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatearHora(pedido.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{pedido.numero}</div>
                    <div className="text-xs text-gray-500">{pedido.detalles.length} producto(s)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Mesa #{pedido.mesa.numero}</div>
                    {pedido.mesa.tipo === 'VIP' && (
                      <span className="text-xs text-purple-600 font-semibold">VIP</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(pedido.estado)}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    ${Number(pedido.total).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <button
                      onClick={() => setPedidoSeleccionado(pedido)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pedidosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600">No hay pedidos para mostrar</p>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Pedido #{pedidoSeleccionado.numero}</h2>
                <p className="text-blue-100">
                  Mesa #{pedidoSeleccionado.mesa.numero} • {formatearHora(pedidoSeleccionado.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Productos</h3>
                  <div className="space-y-2">
                    {pedidoSeleccionado.detalles.map((detalle) => (
                      <div key={detalle.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-700 flex-shrink-0">
                          {detalle.cantidad}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{detalle.producto.nombre}</h4>
                          <p className="text-xs text-gray-500">{detalle.producto.categoria.nombre}</p>
                          {detalle.notas && (
                            <p className="text-sm text-blue-600 mt-1 italic">📝 {detalle.notas}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">${Number(detalle.precioUnit).toLocaleString()} c/u</p>
                          <p className="font-bold text-gray-900">${Number(detalle.subtotal).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${Number(pedidoSeleccionado.subtotal).toLocaleString()}</span>
                    </div>
                    {Number(pedidoSeleccionado.cargoVip) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cargo VIP (10%)</span>
                        <span className="font-medium text-purple-600">${Number(pedidoSeleccionado.cargoVip).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IVA (19%)</span>
                      <span className="font-medium">${Number(pedidoSeleccionado.iva).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-blue-600">${Number(pedidoSeleccionado.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Estado del pedido:</span>
                    <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getEstadoColor(pedidoSeleccionado.estado)}`}>
                      {pedidoSeleccionado.estado}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
