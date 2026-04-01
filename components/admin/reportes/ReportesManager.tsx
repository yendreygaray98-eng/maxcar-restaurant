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

interface Pedido {
  id: string;
  numero: string;
  usuarioId: string;
  metodoPago: string;
  createdAt: string;
  subtotal: number;
  cargoVip: number;
  iva: number;
  total: number;
  mesa: Mesa;
  detalles: DetallePedido[];
}

interface Arqueo {
  id: string;
  fechaApertura: string;
  fechaCierre: string;
  montoInicial: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasTransfer: number;
  totalEsperado: number;
  montoReal: number;
  diferencia: number;
}

interface Usuario {
  id: string;
  nombre: string;
}

interface Props {
  pedidos: Pedido[];
  arqueos: Arqueo[];
  usuarios: Usuario[];
}

export default function ReportesManager({ pedidos, arqueos, usuarios }: Props) {
  const [rangoFecha, setRangoFecha] = useState<'hoy' | 'ayer' | 'semana' | 'mes' | 'personalizado'>('hoy');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [vistaActual, setVistaActual] = useState<'resumen' | 'productos' | 'metodos' | 'meseros' | 'mesas' | 'arqueos'>('resumen');

  // Filtrar pedidos por rango de fecha
  const pedidosFiltrados = useMemo(() => {
    const ahora = new Date();
    let inicio: Date;
    let fin: Date = new Date(ahora);
    fin.setHours(23, 59, 59, 999);

    switch (rangoFecha) {
      case 'hoy':
        inicio = new Date(ahora);
        inicio.setHours(0, 0, 0, 0);
        break;
      case 'ayer':
        inicio = new Date(ahora);
        inicio.setDate(inicio.getDate() - 1);
        inicio.setHours(0, 0, 0, 0);
        fin = new Date(inicio);
        fin.setHours(23, 59, 59, 999);
        break;
      case 'semana':
        inicio = new Date(ahora);
        inicio.setDate(inicio.getDate() - 7);
        inicio.setHours(0, 0, 0, 0);
        break;
      case 'mes':
        inicio = new Date(ahora);
        inicio.setDate(inicio.getDate() - 30);
        inicio.setHours(0, 0, 0, 0);
        break;
      case 'personalizado':
        if (!fechaInicio || !fechaFin) return [];
        inicio = new Date(fechaInicio);
        fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        break;
      default:
        inicio = new Date(ahora);
        inicio.setHours(0, 0, 0, 0);
    }

    return pedidos.filter(p => {
      const fecha = new Date(p.createdAt);
      return fecha >= inicio && fecha <= fin;
    });
  }, [pedidos, rangoFecha, fechaInicio, fechaFin]);

  // Calcular estadísticas generales
  const estadisticas = useMemo(() => {
    const totalVentas = pedidosFiltrados.reduce((sum, p) => sum + Number(p.total), 0);
    const cantidadPedidos = pedidosFiltrados.length;
    const ticketPromedio = cantidadPedidos > 0 ? totalVentas / cantidadPedidos : 0;

    const porMetodo = {
      EFECTIVO: pedidosFiltrados.filter(p => p.metodoPago === 'EFECTIVO').reduce((sum, p) => sum + Number(p.total), 0),
      TARJETA: pedidosFiltrados.filter(p => p.metodoPago === 'TARJETA').reduce((sum, p) => sum + Number(p.total), 0),
      TRANSFERENCIA: pedidosFiltrados.filter(p => p.metodoPago === 'TRANSFERENCIA').reduce((sum, p) => sum + Number(p.total), 0),
    };

    return {
      totalVentas,
      cantidadPedidos,
      ticketPromedio,
      porMetodo,
    };
  }, [pedidosFiltrados]);

  // Productos más vendidos
  const productosMasVendidos = useMemo(() => {
    const productosMap = new Map<string, { nombre: string; cantidad: number; ingresos: number }>();

    pedidosFiltrados.forEach(pedido => {
      pedido.detalles.forEach(detalle => {
        const key = detalle.producto.id;
        const existing = productosMap.get(key);
        if (existing) {
          existing.cantidad += detalle.cantidad;
          existing.ingresos += Number(detalle.subtotal);
        } else {
          productosMap.set(key, {
            nombre: detalle.producto.nombre,
            cantidad: detalle.cantidad,
            ingresos: Number(detalle.subtotal),
          });
        }
      });
    });

    return Array.from(productosMap.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);
  }, [pedidosFiltrados]);

  // Ventas por mesero
  const ventasPorMesero = useMemo(() => {
    const meseroMap = new Map<string, { nombre: string; pedidos: number; total: number }>();

    pedidosFiltrados.forEach(pedido => {
      const usuario = usuarios.find(u => u.id === pedido.usuarioId);
      if (usuario) {
        const existing = meseroMap.get(pedido.usuarioId);
        if (existing) {
          existing.pedidos += 1;
          existing.total += Number(pedido.total);
        } else {
          meseroMap.set(pedido.usuarioId, {
            nombre: usuario.nombre,
            pedidos: 1,
            total: Number(pedido.total),
          });
        }
      }
    });

    return Array.from(meseroMap.values())
      .sort((a, b) => b.total - a.total);
  }, [pedidosFiltrados, usuarios]);

  // Análisis de mesas
  const analisisMesas = useMemo(() => {
    const mesasMap = new Map<number, { tipo: string; pedidos: number; total: number }>();

    pedidosFiltrados.forEach(pedido => {
      const existing = mesasMap.get(pedido.mesa.numero);
      if (existing) {
        existing.pedidos += 1;
        existing.total += Number(pedido.total);
      } else {
        mesasMap.set(pedido.mesa.numero, {
          tipo: pedido.mesa.tipo,
          pedidos: 1,
          total: Number(pedido.total),
        });
      }
    });

    return Array.from(mesasMap.entries())
      .map(([numero, data]) => ({ numero, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [pedidosFiltrados]);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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

      {/* Filtros de fecha */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Período de Análisis</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setRangoFecha('hoy')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              rangoFecha === 'hoy'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setRangoFecha('ayer')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              rangoFecha === 'ayer'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ayer
          </button>
          <button
            onClick={() => setRangoFecha('semana')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              rangoFecha === 'semana'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Última Semana
          </button>
          <button
            onClick={() => setRangoFecha('mes')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              rangoFecha === 'mes'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Último Mes
          </button>
          <button
            onClick={() => setRangoFecha('personalizado')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              rangoFecha === 'personalizado'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Personalizado
          </button>
        </div>

        {rangoFecha === 'personalizado' && (
          <div className="mt-4 flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navegación de vistas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setVistaActual('resumen')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              vistaActual === 'resumen'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resumen General
          </button>
          <button
            onClick={() => setVistaActual('productos')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              vistaActual === 'productos'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setVistaActual('metodos')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              vistaActual === 'metodos'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Métodos de Pago
          </button>
          <button
            onClick={() => setVistaActual('meseros')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              vistaActual === 'meseros'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Meseros
          </button>
          <button
            onClick={() => setVistaActual('mesas')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              vistaActual === 'mesas'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mesas
          </button>
          <button
            onClick={() => setVistaActual('arqueos')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              vistaActual === 'arqueos'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Arqueos
          </button>
        </div>
      </div>

      {/* Vista: Resumen General */}
      {vistaActual === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    ${estadisticas.totalVentas.toLocaleString()}
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
                  <p className="text-sm font-medium text-gray-600">Pedidos</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {estadisticas.cantidadPedidos}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    ${estadisticas.ticketPromedio.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Top 5 Productos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Productos Más Vendidos</h3>
            <div className="space-y-3">
              {productosMasVendidos.slice(0, 5).map((producto, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{producto.nombre}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{producto.cantidad} unidades</p>
                    <p className="text-sm text-gray-600">${producto.ingresos.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vista: Productos */}
      {vistaActual === 'productos' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Productos Más Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Producto</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Cantidad</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {productosMasVendidos.map((producto, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{producto.nombre}</td>
                    <td className="py-3 px-4 text-right text-gray-900">{producto.cantidad}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                      ${producto.ingresos.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista: Métodos de Pago */}
      {vistaActual === 'metodos' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Efectivo</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${estadisticas.porMetodo.EFECTIVO.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {estadisticas.totalVentas > 0 
                ? ((estadisticas.porMetodo.EFECTIVO / estadisticas.totalVentas) * 100).toFixed(1)
                : 0}% del total
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Tarjeta</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">
              ${estadisticas.porMetodo.TARJETA.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {estadisticas.totalVentas > 0 
                ? ((estadisticas.porMetodo.TARJETA / estadisticas.totalVentas) * 100).toFixed(1)
                : 0}% del total
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Transferencia</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              ${estadisticas.porMetodo.TRANSFERENCIA.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {estadisticas.totalVentas > 0 
                ? ((estadisticas.porMetodo.TRANSFERENCIA / estadisticas.totalVentas) * 100).toFixed(1)
                : 0}% del total
            </p>
          </div>
        </div>
      )}

      {/* Vista: Meseros */}
      {vistaActual === 'meseros' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Desempeño por Mesero</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mesero</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Pedidos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Ventas</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {ventasPorMesero.map((mesero, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{mesero.nombre}</td>
                    <td className="py-3 px-4 text-right text-gray-900">{mesero.pedidos}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                      ${mesero.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      ${(mesero.total / mesero.pedidos).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista: Mesas */}
      {vistaActual === 'mesas' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Análisis por Mesa</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mesa</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Pedidos</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Ventas</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {analisisMesas.map((mesa, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">Mesa #{mesa.numero}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                        mesa.tipo === 'VIP' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {mesa.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">{mesa.pedidos}</td>
                    <td className="py-3 px-4 text-right font-semibold text-green-600">
                      ${mesa.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      ${(mesa.total / mesa.pedidos).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista: Arqueos */}
      {vistaActual === 'arqueos' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Historial de Arqueos</h3>
          <div className="space-y-4">
            {arqueos.map((arqueo) => (
              <div key={arqueo.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900">
                      {formatearFecha(arqueo.fechaApertura)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cerrado: {formatearFecha(arqueo.fechaCierre)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    Number(arqueo.diferencia) === 0
                      ? 'bg-green-100 text-green-700'
                      : Number(arqueo.diferencia) > 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {Number(arqueo.diferencia) === 0
                      ? 'Cuadrado'
                      : Number(arqueo.diferencia) > 0
                      ? 'Sobrante'
                      : 'Faltante'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Efectivo</p>
                    <p className="font-semibold">${Number(arqueo.ventasEfectivo).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tarjeta</p>
                    <p className="font-semibold">${Number(arqueo.ventasTarjeta).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Transferencia</p>
                    <p className="font-semibold">${Number(arqueo.ventasTransfer).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Diferencia</p>
                    <p className={`font-bold ${
                      Number(arqueo.diferencia) === 0
                        ? 'text-green-600'
                        : Number(arqueo.diferencia) > 0
                        ? 'text-blue-600'
                        : 'text-red-600'
                    }`}>
                      ${Number(arqueo.diferencia).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
