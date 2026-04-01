'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface Props {
  onClose: () => void;
  usuarioId: string;
  usuarioEmail: string;
}

interface Arqueo {
  id: string;
  montoInicial: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasTransfer: number;
  totalEsperado: number;
  montoReal: number | null;
  diferencia: number | null;
  estado: string;
  fechaApertura: string;
  fechaCierre: string | null;
}

export default function ArqueoModalMejorado({ onClose, usuarioId, usuarioEmail }: Props) {
  const router = useRouter();
  const [arqueoActivo, setArqueoActivo] = useState<Arqueo | null>(null);
  const [montoInicial, setMontoInicial] = useState('300000');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [mostrarCierre, setMostrarCierre] = useState(false);
  const [password, setPassword] = useState('');
  
  // Desglose de billetes y monedas
  const [billetes100k, setBilletes100k] = useState(0);
  const [billetes50k, setBilletes50k] = useState(0);
  const [billetes20k, setBilletes20k] = useState(0);
  const [billetes10k, setBilletes10k] = useState(0);
  const [billetes5k, setBilletes5k] = useState(0);
  const [billetes2k, setBilletes2k] = useState(0);
  const [billetes1k, setBilletes1k] = useState(0);
  const [monedas1k, setMonedas1k] = useState(0);
  const [monedas500, setMonedas500] = useState(0);
  const [monedas200, setMonedas200] = useState(0);
  const [monedas100, setMonedas100] = useState(0);
  const [monedas50, setMonedas50] = useState(0);

  useEffect(() => {
    cargarArqueoActivo();
  }, []);

  const calcularTotalContado = () => {
    return (
      billetes100k * 100000 +
      billetes50k * 50000 +
      billetes20k * 20000 +
      billetes10k * 10000 +
      billetes5k * 5000 +
      billetes2k * 2000 +
      billetes1k * 1000 +
      monedas1k * 1000 +
      monedas500 * 500 +
      monedas200 * 200 +
      monedas100 * 100 +
      monedas50 * 50
    );
  };

  const cargarArqueoActivo = async () => {
    try {
      const response = await fetch('/api/arqueo/activo');
      if (response.ok) {
        const data = await response.json();
        setArqueoActivo(data);
      }
    } catch (error) {
      console.error('Error al cargar arqueo:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleAbrirCaja = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/arqueo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioId,
          montoInicial: parseFloat(montoInicial),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al abrir caja');
      }

      const data = await response.json();
      setArqueoActivo(data);
      router.refresh();
    } catch (error) {
      alert('Error al abrir la caja');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarCaja = async () => {
    if (!arqueoActivo) return;

    const totalContado = calcularTotalContado();
    
    if (totalContado === 0) {
      alert('Debe contar el dinero antes de cerrar la caja');
      return;
    }

    const diferencia = totalContado - Number(arqueoActivo.totalEsperado);
    
    if (Math.abs(diferencia) > 10000 && !observaciones) {
      alert('La diferencia es mayor a $10,000. Por favor agregue observaciones.');
      return;
    }

    if (!password) {
      alert('Debe ingresar su contraseña para cerrar la caja');
      return;
    }

    setLoading(true);
    try {
      // Validar contraseña
      const authResponse = await fetch('/api/auth/validate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: usuarioEmail,
          password,
        }),
      });

      if (!authResponse.ok) {
        alert('Contraseña incorrecta');
        setLoading(false);
        return;
      }

      // Cerrar arqueo
      const response = await fetch(`/api/arqueo/${arqueoActivo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuarioCierreId: usuarioId,
          montoReal: totalContado,
          observaciones,
          billetes100k,
          billetes50k,
          billetes20k,
          billetes10k,
          billetes5k,
          billetes2k,
          billetes1k,
          monedas1k,
          monedas500,
          monedas200,
          monedas100,
          monedas50,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al cerrar caja');
      }

      alert('Caja cerrada exitosamente. Cerrando sesión...');
      
      // Cerrar sesión
      await signOut({ redirect: true, callbackUrl: '/login' });
      
    } catch (error) {
      alert('Error al cerrar la caja');
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const totalContado = calcularTotalContado();
  const diferencia = arqueoActivo ? totalContado - Number(arqueoActivo.totalEsperado) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <h2 className="text-2xl font-bold">Arqueo de Caja</h2>
          <p className="text-blue-100">Gestión de apertura y cierre de caja</p>
        </div>

        <div className="p-6">
          {!arqueoActivo ? (
            // Abrir Caja
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 font-medium">No hay una caja abierta</p>
                <p className="text-blue-700 text-sm mt-1">Ingrese el monto inicial para abrir la caja</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Inicial en Caja
                </label>
                <input
                  type="number"
                  value={montoInicial}
                  onChange={(e) => setMontoInicial(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="300000"
                />
                <p className="text-sm text-gray-500 mt-1">Monto recomendado: $300,000</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAbrirCaja}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Abriendo...' : 'Abrir Caja'}
                </button>
              </div>
            </div>
          ) : !mostrarCierre ? (
            // Resumen de Caja Abierta
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-900 font-medium">Caja Abierta</p>
                <p className="text-green-700 text-sm mt-1">
                  Desde: {new Date(arqueoActivo.fechaApertura).toLocaleString('es-CO')}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Monto Inicial</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${Number(arqueoActivo.montoInicial).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Efectivo</p>
                  <p className="text-xl font-bold text-green-600">
                    ${Number(arqueoActivo.ventasEfectivo).toLocaleString()}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Tarjeta</p>
                  <p className="text-xl font-bold text-blue-600">
                    ${Number(arqueoActivo.ventasTarjeta).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Transferencia</p>
                  <p className="text-xl font-bold text-purple-600">
                    ${Number(arqueoActivo.ventasTransfer).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Esperado en Efectivo</p>
                <p className="text-3xl font-bold text-blue-900">
                  ${Number(arqueoActivo.totalEsperado).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  (Monto inicial + Ventas en efectivo)
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => setMostrarCierre(true)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                  Cerrar Caja
                </button>
              </div>
            </div>
          ) : (
            // Cerrar Caja con Desglose
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-900 font-medium">⚠️ Cierre de Caja</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Cuente el dinero físicamente y registre las cantidades
                </p>
              </div>

              {/* Desglose de Billetes */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Billetes</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $100,000
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={billetes100k}
                      onChange={(e) => setBilletes100k(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${(billetes100k * 100000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $50,000
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={billetes50k}
                      onChange={(e) => setBilletes50k(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${(billetes50k * 50000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $20,000
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={billetes20k}
                      onChange={(e) => setBilletes20k(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${(billetes20k * 20000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $10,000
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={billetes10k}
                      onChange={(e) => setBilletes10k(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${(billetes10k * 10000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $5,000
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={billetes5k}
                      onChange={(e) => setBilletes5k(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${(billetes5k * 5000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $2,000
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={billetes2k}
                      onChange={(e) => setBilletes2k(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${(billetes2k * 2000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $1,000
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={billetes1k}
                      onChange={(e) => setBilletes1k(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${(billetes1k * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desglose de Monedas */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Monedas</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $1,000
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={monedas1k}
                      onChange={(e) => setMonedas1k(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${(monedas1k * 1000).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $500
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={monedas500}
                      onChange={(e) => setMonedas500(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${(monedas500 * 500).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $200
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={monedas200}
                      onChange={(e) => setMonedas200(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${(monedas200 * 200).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $100
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={monedas100}
                      onChange={(e) => setMonedas100(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${(monedas100 * 100).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      $50
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={monedas50}
                      onChange={(e) => setMonedas50(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ${(monedas50 * 50).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Contado y Diferencia */}
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Contado:</span>
                    <span className="text-2xl font-bold text-blue-900">
                      ${totalContado.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Esperado:</span>
                    <span className="text-xl font-bold text-gray-900">
                      ${Number(arqueoActivo.totalEsperado).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className={`border-2 rounded-lg p-4 ${
                  diferencia === 0 
                    ? 'bg-green-50 border-green-500' 
                    : diferencia > 0 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'bg-red-50 border-red-500'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Diferencia:</span>
                    <span className={`text-2xl font-bold ${
                      diferencia === 0 
                        ? 'text-green-600' 
                        : diferencia > 0 
                        ? 'text-blue-600' 
                        : 'text-red-600'
                    }`}>
                      {diferencia >= 0 ? '+' : ''}${diferencia.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {diferencia === 0 && 'Caja cuadrada ✓'}
                    {diferencia > 0 && 'Sobrante'}
                    {diferencia < 0 && 'Faltante'}
                  </p>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones {Math.abs(diferencia) > 10000 && <span className="text-red-600">*</span>}
                </label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Explique la diferencia si existe..."
                />
              </div>

              {/* Contraseña */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-red-900 mb-2">
                  Confirme su contraseña para cerrar la caja *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  placeholder="Ingrese su contraseña"
                />
                <p className="text-xs text-red-700 mt-2">
                  ⚠️ Al cerrar la caja, su sesión se cerrará automáticamente
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarCierre(false)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCerrarCaja}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Cerrando...' : 'Confirmar Cierre'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
