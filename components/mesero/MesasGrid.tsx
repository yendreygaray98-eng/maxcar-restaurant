'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotificationSound } from '@/lib/useNotificationSound';

interface Mesa {
  id: string;
  numero: number;
  tipo: string;
  capacidad: number;
  estado: string;
}

interface Props {
  mesas: Mesa[];
}

export default function MesasGrid({ mesas: mesasIniciales }: Props) {
  const router = useRouter();
  const [mesas, setMesas] = useState(mesasIniciales);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());
  const { checkForNewItems } = useNotificationSound();

  useEffect(() => {
    // Actualizar mesas cuando cambien los props
    setMesas(mesasIniciales);
    setUltimaActualizacion(new Date());
    
    // Detectar mesas que se liberaron (fueron cobradas) y reproducir sonido
    const mesasLibres = mesasIniciales.filter(m => m.estado === 'LIBRE');
    checkForNewItems(mesasLibres.length, 'orden-cobrada');
  }, [mesasIniciales, checkForNewItems]);

  useEffect(() => {
    // Auto-refresh cada 3 segundos (más frecuente para evitar conflictos)
    const interval = setInterval(() => {
      setActualizando(true);
      router.refresh();
      setTimeout(() => setActualizando(false), 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  const mesasFiltradas = mesas.filter((mesa) => {
    const matchEstado = !filtroEstado || mesa.estado === filtroEstado;
    const matchTipo = !filtroTipo || mesa.tipo === filtroTipo;
    return matchEstado && matchTipo;
  });

  const mesasVIP = mesasFiltradas.filter(m => m.tipo === 'VIP');
  const mesasRegulares = mesasFiltradas.filter(m => m.tipo === 'REGULAR');

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'LIBRE':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'OCUPADA':
        return 'bg-red-100 border-red-400 text-red-800';
      case 'RESERVADA':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'MANTENIMIENTO':
        return 'bg-gray-100 border-gray-400 text-gray-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'LIBRE':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'OCUPADA':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'RESERVADA':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleMesaClick = async (mesa: Mesa, e: React.MouseEvent) => {
    e.preventDefault();
    if (mesa.estado === 'MANTENIMIENTO') {
      alert('Esta mesa está en mantenimiento');
      return;
    }
    
    // Verificar estado actual antes de permitir acción
    try {
      const response = await fetch(`/api/mesas/${mesa.id}`);
      const mesaActual = await response.json();
      
      if (mesaActual.estado !== mesa.estado) {
        alert(`Esta mesa acaba de cambiar de estado. Estado actual: ${mesaActual.estado}. Actualizando...`);
        router.refresh();
        return;
      }
      
      setMesaSeleccionada(mesa);
      setMostrarMenu(true);
    } catch (error) {
      alert('Error al verificar el estado de la mesa');
    }
  };

  const handleCambiarEstado = async (nuevoEstado: string) => {
    if (!mesaSeleccionada) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/mesas/${mesaSeleccionada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: mesaSeleccionada.tipo,
          capacidad: mesaSeleccionada.capacidad,
          estado: nuevoEstado,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar mesa');
      }

      const mesaActualizada = await response.json();
      setMesas(mesas.map(m => m.id === mesaActualizada.id ? mesaActualizada : m));
      setMostrarMenu(false);
      setMesaSeleccionada(null);
      router.refresh();
    } catch (error) {
      alert('Error al cambiar el estado de la mesa');
    } finally {
      setLoading(false);
    }
  };

  const handleTomarPedido = () => {
    if (!mesaSeleccionada) return;
    router.push(`/mesero/mesa/${mesaSeleccionada.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Mesas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{mesas.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Libres</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {mesas.filter(m => m.estado === 'LIBRE').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Ocupadas</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {mesas.filter(m => m.estado === 'OCUPADA').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Reservadas</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {mesas.filter(m => m.estado === 'RESERVADA').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de sincronización */}
      <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        {actualizando ? (
          <>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Actualizando mesas...</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Última actualización: {ultimaActualizacion.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </>
        )}
        <span className="text-xs text-gray-500 ml-auto">Auto-actualización cada 3 segundos</span>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="VIP">VIP</option>
            <option value="REGULAR">Regular</option>
          </select>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="LIBRE">Libre</option>
            <option value="OCUPADA">Ocupada</option>
            <option value="RESERVADA">Reservada</option>
          </select>
        </div>
      </div>

      {/* Mesas VIP */}
      {mesasVIP.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-300">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h2 className="text-xl font-bold text-purple-900">Mesas VIP</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mesasVIP.map((mesa) => (
              <button
                key={mesa.id}
                onClick={(e) => handleMesaClick(mesa, e)}
                className={`p-6 border-2 rounded-lg transition-all hover:scale-105 hover:shadow-lg ${getEstadoColor(mesa.estado)}`}
              >
                <div className="flex flex-col items-center gap-2">
                  {getEstadoIcon(mesa.estado)}
                  <span className="text-3xl font-bold">#{mesa.numero}</span>
                  <span className="text-xs font-medium">{mesa.capacidad} personas</span>
                  <span className="text-xs font-semibold uppercase">{mesa.estado}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mesas Regulares */}
      {mesasRegulares.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mesas Regulares</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {mesasRegulares.map((mesa) => (
              <button
                key={mesa.id}
                onClick={(e) => handleMesaClick(mesa, e)}
                className={`p-6 border-2 rounded-lg transition-all hover:scale-105 hover:shadow-lg ${getEstadoColor(mesa.estado)}`}
              >
                <div className="flex flex-col items-center gap-2">
                  {getEstadoIcon(mesa.estado)}
                  <span className="text-3xl font-bold">#{mesa.numero}</span>
                  <span className="text-xs font-medium">{mesa.capacidad} personas</span>
                  <span className="text-xs font-semibold uppercase">{mesa.estado}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {mesasFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No se encontraron mesas con los filtros seleccionados</p>
        </div>
      )}

      {/* Modal de acciones */}
      {mostrarMenu && mesaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Mesa #{mesaSeleccionada.numero}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {mesaSeleccionada.tipo} • {mesaSeleccionada.capacidad} personas
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    mesaSeleccionada.estado === 'LIBRE' ? 'bg-green-100 text-green-800' :
                    mesaSeleccionada.estado === 'OCUPADA' ? 'bg-red-100 text-red-800' :
                    mesaSeleccionada.estado === 'RESERVADA' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {mesaSeleccionada.estado}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMostrarMenu(false);
                    setMesaSeleccionada(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <button
                onClick={handleTomarPedido}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Tomar Pedido
              </button>

              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">Cambiar estado:</p>
                <div className="space-y-2">
                  {mesaSeleccionada.estado !== 'LIBRE' && (
                    <button
                      onClick={() => handleCambiarEstado('LIBRE')}
                      disabled={loading}
                      className="w-full bg-green-50 text-green-700 py-2 px-4 rounded-lg font-medium hover:bg-green-100 transition-colors border border-green-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Marcar como Libre
                    </button>
                  )}
                  {mesaSeleccionada.estado !== 'OCUPADA' && (
                    <button
                      onClick={() => handleCambiarEstado('OCUPADA')}
                      disabled={loading}
                      className="w-full bg-red-50 text-red-700 py-2 px-4 rounded-lg font-medium hover:bg-red-100 transition-colors border border-red-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Marcar como Ocupada
                    </button>
                  )}
                  {mesaSeleccionada.estado !== 'RESERVADA' && (
                    <button
                      onClick={() => handleCambiarEstado('RESERVADA')}
                      disabled={loading}
                      className="w-full bg-yellow-50 text-yellow-700 py-2 px-4 rounded-lg font-medium hover:bg-yellow-100 transition-colors border border-yellow-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Marcar como Reservada
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
