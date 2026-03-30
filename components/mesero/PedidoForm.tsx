'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen: string | null;
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

interface Mesa {
  id: string;
  numero: number;
  tipo: string;
  capacidad: number;
  estado: string;
}

interface DetallePedido {
  id?: string;
  productoId: string;
  producto?: Producto;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  notas: string;
}

interface PedidoActivo {
  id: string;
  numero: string;
  estado: string;
  detalles: DetallePedido[];
}

interface Props {
  mesa: Mesa;
  productos: Producto[];
  categorias: Categoria[];
  pedidoActivo: PedidoActivo | null;
  usuarioId: string;
}

export default function PedidoForm({ mesa, productos, categorias, pedidoActivo, usuarioId }: Props) {
  const router = useRouter();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>(categorias[0]?.id || '');
  const [busqueda, setBusqueda] = useState('');
  
  // Separar productos del pedido activo de los nuevos
  const [productosEnviados, setProductosEnviados] = useState<DetallePedido[]>(
    pedidoActivo?.detalles.map(d => ({
      id: d.id,
      productoId: d.producto?.id || d.productoId,
      producto: d.producto,
      cantidad: d.cantidad,
      precioUnit: Number(d.precioUnit),
      subtotal: Number(d.subtotal),
      notas: d.notas || '',
    })) || []
  );
  
  const [detalles, setDetalles] = useState<DetallePedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarPedido, setMostrarPedido] = useState(false);
  const [mostrarCancelar, setMostrarCancelar] = useState(false);

  const productosFiltrados = productos.filter((producto) => {
    const matchCategoria = !categoriaSeleccionada || producto.categoria.id === categoriaSeleccionada;
    const matchBusqueda = !busqueda || 
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.codigo.toLowerCase().includes(busqueda.toLowerCase());
    return matchCategoria && matchBusqueda;
  });

  const agregarProducto = (producto: Producto) => {
    const existente = detalles.find(d => d.productoId === producto.id);
    
    if (existente) {
      setDetalles(detalles.map(d => 
        d.productoId === producto.id 
          ? { ...d, cantidad: d.cantidad + 1, subtotal: (d.cantidad + 1) * d.precioUnit }
          : d
      ));
    } else {
      setDetalles([...detalles, {
        productoId: producto.id,
        producto,
        cantidad: 1,
        precioUnit: Number(producto.precio),
        subtotal: Number(producto.precio),
        notas: '',
      }]);
    }
  };

  const actualizarCantidad = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      setDetalles(detalles.filter(d => d.productoId !== productoId));
    } else {
      setDetalles(detalles.map(d => 
        d.productoId === productoId 
          ? { ...d, cantidad, subtotal: cantidad * d.precioUnit }
          : d
      ));
    }
  };

  const actualizarNotas = (productoId: string, notas: string) => {
    setDetalles(detalles.map(d => 
      d.productoId === productoId ? { ...d, notas } : d
    ));
  };

  const eliminarProducto = (productoId: string) => {
    setDetalles(detalles.filter(d => d.productoId !== productoId));
  };

  const handleEnviarPedido = async () => {
    if (detalles.length === 0) {
      setError('Debe agregar al menos un producto nuevo');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { subtotal, cargoVip, iva, total } = calcularTotales();

      if (pedidoActivo) {
        // Actualizar pedido existente agregando nuevos productos
        const response = await fetch(`/api/pedidos/${pedidoActivo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            detalles: detalles.map(d => ({
              productoId: d.productoId,
              cantidad: d.cantidad,
              precioUnit: d.precioUnit,
              subtotal: d.subtotal,
              notas: d.notas,
            })),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al actualizar pedido');
        }
      } else {
        // Crear nuevo pedido
        const response = await fetch('/api/pedidos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mesaId: mesa.id,
            usuarioId,
            detalles: detalles.map(d => ({
              productoId: d.productoId,
              cantidad: d.cantidad,
              precioUnit: d.precioUnit,
              subtotal: d.subtotal,
              notas: d.notas,
            })),
            subtotal,
            cargoVip,
            iva,
            total,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Error al crear pedido');
        }
      }

      router.push('/mesero');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCancelarPedido = async () => {
    if (!pedidoActivo) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/pedidos/${pedidoActivo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'CANCELADO' }),
      });

      if (!response.ok) {
        throw new Error('Error al cancelar pedido');
      }

      router.push('/mesero');
      router.refresh();
    } catch (error) {
      alert('Error al cancelar el pedido');
      setLoading(false);
    }
  };

  const calcularTotales = () => {
    const subtotalNuevos = detalles.reduce((sum, d) => sum + d.subtotal, 0);
    const subtotalEnviados = productosEnviados.reduce((sum, d) => sum + d.subtotal, 0);
    const subtotal = subtotalNuevos + subtotalEnviados;
    const cargoVip = mesa.tipo === 'VIP' ? subtotal * 0.10 : 0;
    const iva = (subtotal + cargoVip) * 0.19;
    const total = subtotal + cargoVip + iva;
    return { subtotal, subtotalNuevos, subtotalEnviados, cargoVip, iva, total };
  };

  const { subtotal, subtotalNuevos, subtotalEnviados, cargoVip, iva, total } = calcularTotales();
  const categoriaActual = categorias.find(c => c.id === categoriaSeleccionada);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {pedidoActivo && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Pedido #{pedidoActivo.numero} - {pedidoActivo.estado === 'PENDIENTE' ? 'Pendiente' : 'En Preparación'}
                </p>
                <p className="text-xs text-blue-700">
                  Puedes agregar más productos o cancelar el pedido completo
                </p>
              </div>
            </div>
            <button
              onClick={() => setMostrarCancelar(true)}
              className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
            >
              Cancelar Pedido
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 p-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-48 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          {categorias.map((categoria) => {
            const productosEnCategoria = productos.filter(p => p.categoria.id === categoria.id).length;
            return (
              <button
                key={categoria.id}
                onClick={() => setCategoriaSeleccionada(categoria.id)}
                className={`w-full text-left px-4 py-4 border-b border-gray-200 transition-colors ${
                  categoriaSeleccionada === categoria.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="font-semibold">{categoria.nombre}</div>
                <div className={`text-xs mt-1 ${
                  categoriaSeleccionada === categoria.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {productosEnCategoria} productos
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {categoriaActual && (
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{categoriaActual.nombre}</h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {productosFiltrados.map((producto) => (
              <button
                key={producto.id}
                onClick={() => agregarProducto(producto)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-500 transition-all group"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
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
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                    <svg className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[3rem]">
                    {producto.nombre}
                  </h3>
                  {producto.descripcion && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                      {producto.descripcion}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      ${Number(producto.precio).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">{producto.codigo}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-16">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600 text-lg">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {detalles.length > 0 && (
        <button
          onClick={() => setMostrarPedido(true)}
          className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-4 rounded-full shadow-lg flex items-center gap-2 z-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="font-semibold">{detalles.length + productosEnviados.length}</span>
          <span className="ml-2">${total.toLocaleString()}</span>
        </button>
      )}

      {/* Panel del pedido (desktop) */}
      <div className="hidden lg:block fixed right-0 top-[140px] bottom-0 w-96 bg-white border-l border-gray-200 shadow-xl overflow-hidden z-40">
        <div className="h-full flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <h2 className="text-2xl font-bold mb-2">Pedido Actual</h2>
            <p className="text-blue-100">Mesa #{mesa.numero}</p>
          </div>

          {(detalles.length === 0 && productosEnviados.length === 0) ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500 text-lg">Pedido vacío</p>
                <p className="text-gray-400 text-sm mt-2">Selecciona productos del menú</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Productos ya enviados a cocina */}
                {productosEnviados.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <h4 className="text-xs font-semibold text-gray-600 uppercase">En Cocina</h4>
                    </div>
                    {productosEnviados.map((detalle) => (
                      <div key={detalle.id} className="bg-gray-100 rounded-lg p-4 border border-gray-300 opacity-60 mb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-700">{detalle.producto?.nombre}</h4>
                            <p className="text-sm text-gray-600">
                              ${detalle.precioUnit.toLocaleString()} c/u
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-700">x{detalle.cantidad}</span>
                            <p className="font-bold text-gray-700">${detalle.subtotal.toLocaleString()}</p>
                          </div>
                        </div>
                        {detalle.notas && (
                          <p className="text-sm text-gray-600 mt-2 italic">📝 {detalle.notas}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Productos nuevos */}
                {detalles.length > 0 && (
                  <div>
                    {productosEnviados.length > 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <h4 className="text-xs font-semibold text-green-600 uppercase">Nuevos Productos</h4>
                      </div>
                    )}
                    {detalles.map((detalle) => (
                  <div key={detalle.productoId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{detalle.producto?.nombre}</h4>
                        <p className="text-sm text-gray-600">
                          ${detalle.precioUnit.toLocaleString()} c/u
                        </p>
                      </div>
                      <button
                        onClick={() => eliminarProducto(detalle.productoId)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => actualizarCantidad(detalle.productoId, detalle.cantidad - 1)}
                          className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-12 text-center font-bold text-lg">{detalle.cantidad}</span>
                        <button
                          onClick={() => actualizarCantidad(detalle.productoId, detalle.cantidad + 1)}
                          className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <span className="font-bold text-lg text-gray-900">
                        ${detalle.subtotal.toLocaleString()}
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="Notas especiales..."
                      value={detalle.notas}
                      onChange={(e) => actualizarNotas(detalle.productoId, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 p-6 bg-white">
                <div className="space-y-2 mb-4">
                  {subtotalEnviados > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal enviado</span>
                      <span>${subtotalEnviados.toLocaleString()}</span>
                    </div>
                  )}
                  {subtotalNuevos > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Subtotal nuevo</span>
                      <span>${subtotalNuevos.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toLocaleString()}</span>
                  </div>
                  {cargoVip > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cargo VIP (10%)</span>
                      <span className="font-medium text-purple-600">${cargoVip.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IVA (19%)</span>
                    <span className="font-medium">${iva.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-blue-600">${total.toLocaleString()}</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleEnviarPedido}
                  disabled={loading || detalles.length === 0}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? 'Enviando...' : pedidoActivo ? 'Agregar a Pedido' : 'Enviar a Cocina'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal del pedido (móvil) */}
      {mostrarPedido && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[90vh] rounded-t-2xl overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Pedido Actual</h2>
                <p className="text-blue-100">Mesa #{mesa.numero}</p>
              </div>
              <button
                onClick={() => setMostrarPedido(false)}
                className="text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {detalles.map((detalle) => (
                <div key={detalle.productoId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{detalle.producto?.nombre}</h4>
                      <p className="text-sm text-gray-600">
                        ${detalle.precioUnit.toLocaleString()} c/u
                      </p>
                    </div>
                    <button
                      onClick={() => eliminarProducto(detalle.productoId)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => actualizarCantidad(detalle.productoId, detalle.cantidad - 1)}
                        className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-bold">{detalle.cantidad}</span>
                      <button
                        onClick={() => actualizarCantidad(detalle.productoId, detalle.cantidad + 1)}
                        className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-gray-900">
                      ${detalle.subtotal.toLocaleString()}
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Notas especiales..."
                    value={detalle.notas}
                    onChange={(e) => actualizarNotas(detalle.productoId, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-6 bg-white">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>
                {cargoVip > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cargo VIP (10%)</span>
                    <span className="font-medium text-purple-600">${cargoVip.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA (19%)</span>
                  <span className="font-medium">${iva.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-600">${total.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleEnviarPedido}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-4 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Enviando...' : 'Enviar a Cocina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      {mostrarCancelar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cancelar Pedido</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas cancelar el pedido #{pedidoActivo?.numero}? 
              Todos los productos serán eliminados.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setMostrarCancelar(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                No, mantener
              </button>
              <button
                onClick={handleCancelarPedido}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
