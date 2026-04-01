'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen: string | null;
  stockActual: number | null;
  stockMinimo: number | null;
  categoria: {
    id: string;
    nombre: string;
    codigo: string;
  };
}

interface Categoria {
  id: string;
  codigo: string;
  nombre: string;
}

interface Props {
  productos: Producto[];
  categorias: Categoria[];
}

export default function ProductosManager({ productos, categorias }: Props) {
  const router = useRouter();
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [busqueda, setBusqueda] = useState('');
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(false);

  const productosFiltrados = productos.filter((producto) => {
    const matchCategoria = !filtroCategoria || producto.categoria.id === filtroCategoria;
    const matchBusqueda = !busqueda || 
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el producto "${nombre}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }

      alert('Producto eliminado exitosamente');
      router.refresh();
    } catch (error) {
      alert('Error al eliminar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarEdicion = async () => {
    if (!productoEditar) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/productos/${productoEditar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigo: productoEditar.codigo,
          nombre: productoEditar.nombre,
          descripcion: productoEditar.descripcion,
          precio: productoEditar.precio,
          categoriaId: productoEditar.categoria.id,
          stockMinimo: productoEditar.stockMinimo,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar producto');
      }

      alert('Producto actualizado exitosamente');
      setProductoEditar(null);
      router.refresh();
    } catch (error) {
      alert('Error al actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          <Link
            href="/admin/productos/nuevo"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Nuevo Producto
          </Link>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Mostrando {productosFiltrados.length} de {productos.length} productos
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productosFiltrados.map((producto) => (
          <div
            key={producto.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {producto.imagen ? (
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-xs text-gray-500 mb-1">{producto.codigo}</p>
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 min-h-[3.5rem]">{producto.nombre}</h3>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded whitespace-nowrap flex-shrink-0">
                  {producto.categoria.nombre}
                </span>
              </div>

              <div className="mb-3 h-[2.5rem]">
                {producto.descripcion && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {producto.descripcion}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(Number(producto.precio))}
                </span>
              </div>

              {producto.categoria.codigo === 'BEB' ? (
                <div className="flex items-center gap-2 text-sm mb-3 h-6">
                  <span className="text-gray-600">Stock:</span>
                  <span className={`font-medium ${
                    (producto.stockActual || 0) <= (producto.stockMinimo || 0)
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}>
                    {producto.stockActual || 0} unidades
                  </span>
                </div>
              ) : (
                <div className="mb-3 h-6"></div>
              )}

              <div className="flex gap-2 mt-auto">
                <button 
                  onClick={() => setProductoEditar(producto)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Editar
                </button>
                <button 
                  onClick={() => handleEliminar(producto.id, producto.nombre)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {productosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-600 mb-4">
            Intenta ajustar los filtros o crea un nuevo producto
          </p>
          <Link
            href="/admin/productos/nuevo"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Crear Producto
          </Link>
        </div>
      )}

      {/* Modal de Edición */}
      {productoEditar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <h2 className="text-2xl font-bold">Editar Producto</h2>
              <p className="text-blue-100">Modifica la información del producto</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código
                </label>
                <input
                  type="text"
                  value={productoEditar.codigo}
                  onChange={(e) => setProductoEditar({...productoEditar, codigo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={productoEditar.nombre}
                  onChange={(e) => setProductoEditar({...productoEditar, nombre: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={productoEditar.descripcion || ''}
                  onChange={(e) => setProductoEditar({...productoEditar, descripcion: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio *
                </label>
                <input
                  type="number"
                  value={productoEditar.precio}
                  onChange={(e) => setProductoEditar({...productoEditar, precio: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={productoEditar.categoria.id}
                  onChange={(e) => {
                    const cat = categorias.find(c => c.id === e.target.value);
                    if (cat) {
                      setProductoEditar({
                        ...productoEditar, 
                        categoria: cat
                      });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {productoEditar.categoria.codigo === 'BEB' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    value={productoEditar.stockMinimo || 0}
                    onChange={(e) => setProductoEditar({...productoEditar, stockMinimo: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setProductoEditar(null)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarEdicion}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
