'use client';

import { useState } from 'react';
import Link from 'next/link';
import EditarUsuarioModal from './EditarUsuarioModal';

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  estado: string;
  createdAt: string;
}

interface Props {
  usuarios: Usuario[];
}

export default function UsuariosTable({ usuarios: usuariosIniciales }: Props) {
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const matchBusqueda = !busqueda || 
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol = !filtroRol || usuario.rol === filtroRol;
    const matchEstado = !filtroEstado || usuario.estado === filtroEstado;
    return matchBusqueda && matchRol && matchEstado;
  });

  const roles = ['ADMINISTRADOR', 'MESERO', 'CHEF', 'CAJERO', 'RECEPCIONISTA'];
  const estados = ['ACTIVO', 'INACTIVO'];

  const getRolColor = (rol: string) => {
    const colors: Record<string, string> = {
      ADMINISTRADOR: 'bg-purple-100 text-purple-700',
      MESERO: 'bg-blue-100 text-blue-700',
      CHEF: 'bg-orange-100 text-orange-700',
      CAJERO: 'bg-green-100 text-green-700',
      RECEPCIONISTA: 'bg-pink-100 text-pink-700',
    };
    return colors[rol] || 'bg-gray-100 text-gray-700';
  };

  const handleEditar = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setModalAbierto(true);
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }

      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch (error) {
      alert('Error al eliminar usuario');
    }
  };

  const handleGuardarEdicion = async (usuarioActualizado: Usuario) => {
    setUsuarios(usuarios.map(u => u.id === usuarioActualizado.id ? usuarioActualizado : u));
    setModalAbierto(false);
    setUsuarioEditando(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los roles</option>
            {roles.map((rol) => (
              <option key={rol} value={rol}>{rol}</option>
            ))}
          </select>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
          <Link
            href="/admin/usuarios/nuevo"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Nuevo Usuario
          </Link>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                      <div className="text-sm text-gray-500">{usuario.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getRolColor(usuario.rol)}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      usuario.estado === 'ACTIVO' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(usuario.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditar(usuario)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleEliminar(usuario.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {usuariosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-600">No se encontraron usuarios</p>
        </div>
      )}

      {modalAbierto && usuarioEditando && (
        <EditarUsuarioModal
          usuario={usuarioEditando}
          onClose={() => {
            setModalAbierto(false);
            setUsuarioEditando(null);
          }}
          onGuardar={handleGuardarEdicion}
        />
      )}
    </div>
  );
}
