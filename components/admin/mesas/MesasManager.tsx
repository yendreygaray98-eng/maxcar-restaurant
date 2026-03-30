'use client';

import { useState } from 'react';
import MesaCard from './MesaCard';
import MesaFormModal from './MesaFormModal';

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

export default function MesasManager({ mesas: mesasIniciales }: Props) {
  const [mesas, setMesas] = useState(mesasIniciales);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mesaEditar, setMesaEditar] = useState<Mesa | null>(null);

  const mesasFiltradas = mesas.filter((mesa) => {
    const matchTipo = !filtroTipo || mesa.tipo === filtroTipo;
    const matchEstado = !filtroEstado || mesa.estado === filtroEstado;
    return matchTipo && matchEstado;
  });

  const mesasVIP = mesasFiltradas.filter(m => m.tipo === 'VIP');
  const mesasRegulares = mesasFiltradas.filter(m => m.tipo === 'REGULAR');

  const handleMesaCreada = (nuevaMesa: Mesa) => {
    setMesas([...mesas, nuevaMesa]);
    setModalAbierto(false);
    setMesaEditar(null);
  };

  const handleMesaActualizada = (mesaActualizada: Mesa) => {
    setMesas(mesas.map(m => m.id === mesaActualizada.id ? mesaActualizada : m));
    setModalAbierto(false);
    setMesaEditar(null);
  };

  const handleEditarMesa = (mesa: Mesa) => {
    setMesaEditar(mesa);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setMesaEditar(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
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
          <button
            onClick={() => setModalAbierto(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap ml-auto"
          >
            Nueva Mesa
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-600">Total Mesas</div>
            <div className="text-2xl font-bold text-gray-900">{mesas.length}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-green-600">Libres</div>
            <div className="text-2xl font-bold text-green-700">
              {mesas.filter(m => m.estado === 'LIBRE').length}
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-red-600">Ocupadas</div>
            <div className="text-2xl font-bold text-red-700">
              {mesas.filter(m => m.estado === 'OCUPADA').length}
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <div className="text-yellow-600">Reservadas</div>
            <div className="text-2xl font-bold text-yellow-700">
              {mesas.filter(m => m.estado === 'RESERVADA').length}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-gray-600">Mantenimiento</div>
            <div className="text-2xl font-bold text-gray-700">
              {mesas.filter(m => m.estado === 'MANTENIMIENTO').length}
            </div>
          </div>
        </div>
      </div>

      {mesasVIP.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-300">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h2 className="text-xl font-bold text-purple-900">Mesas VIP</h2>
            <span className="ml-auto bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {mesasVIP.length} {mesasVIP.length === 1 ? 'mesa' : 'mesas'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {mesasVIP.map((mesa) => (
              <MesaCard key={mesa.id} mesa={mesa} onEdit={handleEditarMesa} />
            ))}
          </div>
        </div>
      )}

      {mesasRegulares.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Mesas Regulares</h2>
            <span className="ml-auto bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {mesasRegulares.length} {mesasRegulares.length === 1 ? 'mesa' : 'mesas'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {mesasRegulares.map((mesa) => (
              <MesaCard key={mesa.id} mesa={mesa} onEdit={handleEditarMesa} />
            ))}
          </div>
        </div>
      )}

      {mesasFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">No se encontraron mesas</p>
          <button
            onClick={() => setModalAbierto(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Crear Primera Mesa
          </button>
        </div>
      )}

      {modalAbierto && (
        <MesaFormModal
          mesa={mesaEditar}
          onClose={handleCerrarModal}
          onMesaCreada={handleMesaCreada}
          onMesaActualizada={handleMesaActualizada}
        />
      )}
    </div>
  );
}
