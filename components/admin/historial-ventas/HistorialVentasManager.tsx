'use client';

import { useState, useMemo } from 'react';

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
  producto: Producto;
}

interface Mesa {
  numero: number;
  tipo: string;
}

interface Venta {
  id: string;
  numero: string;
  numeroFactura: string | null;
  clienteNombre: string | null;
  clienteDocumento: string | null;
  metodoPago: string;
  createdAt: string;
  subtotal: number;
  cargoVip: number;
  iva: number;
  total: number;
  mesa: Mesa;
  detalles: DetallePedido[];
}

interface Props {
  ventas: Venta[];
}

export default function HistorialVentasManager({ ventas }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroFactura, setFiltroFactura] = useState<'todas' | 'con-factura' | 'sin-factura'>('todas');
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  // Filtrar ventas
  const ventasFiltradas = useMemo(() => {
    let resultado = ventas;

    // Filtrar por factura
    if (filtroFactura === 'con-factura') {
      resultado = resultado.filter(v => v.numeroFactura !== null);
    } else if (filtroFactura === 'sin-factura') {
      resultado = resultado.filter(v => v.numeroFactura === null);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(v => 
        v.numero.toLowerCase().includes(termino) ||
        v.numeroFactura?.toLowerCase().includes(termino) ||
        v.clienteNombre?.toLowerCase().includes(termino) ||
        v.clienteDocumento?.toLowerCase().includes(termino) ||
        v.mesa.numero.toString().includes(termino)
      );
    }

    return resultado;
  }, [ventas, busqueda, filtroFactura]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const descargarFactura = (venta: Venta) => {
    // Abrir el PDF en una nueva pestaña
    window.open(`/api/factura/${venta.id}`, '_blank');
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

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Número de pedido, factura, cliente, mesa..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltroFactura('todas')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroFactura === 'todas'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltroFactura('con-factura')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroFactura === 'con-factura'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Con Factura
              </button>
              <button
                onClick={() => setFiltroFactura('sin-factura')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filtroFactura === 'sin-factura'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sin Factura
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Total Ventas</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {ventasFiltradas.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Con Factura</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {ventasFiltradas.filter(v => v.numeroFactura).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Monto Total</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            ${ventasFiltradas.reduce((sum, v) => sum + Number(v.total), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Pedido</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Factura</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Cliente</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Mesa</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Método</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.map((venta) => (
                <tr key={venta.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatearFecha(venta.createdAt)}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    #{venta.numero}
                  </td>
                  <td className="py-3 px-4">
                    {venta.numeroFactura ? (
                      <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        {venta.numeroFactura}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin factura</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {venta.clienteNombre ? (
                      <div>
                        <p className="font-medium text-gray-900">{venta.clienteNombre}</p>
                        <p className="text-gray-500 text-xs">{venta.clienteDocumento}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    Mesa #{venta.mesa.numero}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      venta.metodoPago === 'EFECTIVO'
                        ? 'bg-green-100 text-green-700'
                        : venta.metodoPago === 'TARJETA'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {venta.metodoPago}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    ${Number(venta.total).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setVentaSeleccionada(venta)}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                      >
                        Ver Detalle
                      </button>
                      <button
                        onClick={() => descargarFactura(venta)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Descargar PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ventasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">No se encontraron ventas</p>
          </div>
        )}
      </div>

      {/* Modal de detalle de venta */}
      {ventaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Detalle de Venta</h2>
                  <p className="text-purple-100">Pedido #{ventaSeleccionada.numero}</p>
                  {ventaSeleccionada.numeroFactura && (
                    <p className="text-purple-100 font-bold mt-1">
                      Factura: {ventaSeleccionada.numeroFactura}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setVentaSeleccionada(null)}
                  className="text-white hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha y Hora</p>
                  <p className="font-semibold text-gray-900">{formatearFecha(ventaSeleccionada.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mesa</p>
                  <p className="font-semibold text-gray-900">
                    Mesa #{ventaSeleccionada.mesa.numero} 
                    {ventaSeleccionada.mesa.tipo === 'VIP' && (
                      <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                        VIP
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Método de Pago</p>
                  <p className="font-semibold text-gray-900">{ventaSeleccionada.metodoPago}</p>
                </div>
                {ventaSeleccionada.clienteNombre && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Cliente</p>
                      <p className="font-semibold text-gray-900">{ventaSeleccionada.clienteNombre}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Documento</p>
                      <p className="font-semibold text-gray-900">{ventaSeleccionada.clienteDocumento}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Productos */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Productos</h3>
                <div className="space-y-2">
                  {ventaSeleccionada.detalles.map((detalle) => (
                    <div key={detalle.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center font-bold text-purple-700">
                          {detalle.cantidad}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{detalle.producto.nombre}</p>
                          <p className="text-sm text-gray-600">${Number(detalle.precioUnit).toLocaleString()} c/u</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${Number(detalle.subtotal).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${Number(ventaSeleccionada.subtotal).toLocaleString()}</span>
                </div>
                {Number(ventaSeleccionada.cargoVip) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cargo VIP</span>
                    <span className="font-medium text-purple-600">${Number(ventaSeleccionada.cargoVip).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (19%)</span>
                  <span className="font-medium">${Number(ventaSeleccionada.iva).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-purple-600">${Number(ventaSeleccionada.total).toLocaleString()}</span>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={() => setVentaSeleccionada(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => descargarFactura(ventaSeleccionada)}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors"
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
