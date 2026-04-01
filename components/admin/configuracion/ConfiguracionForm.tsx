'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Config {
  id: string;
  nombreRestaurante: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string | null;
  ciudad: string;
  regimenTributario: string;
  resolucionDian: string | null;
  rangoFacturacion: string | null;
  pieFactura: string | null;
}

interface Props {
  config: Config | null;
}

export default function ConfiguracionForm({ config }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombreRestaurante: config?.nombreRestaurante || '',
    nit: config?.nit || '',
    direccion: config?.direccion || '',
    telefono: config?.telefono || '',
    email: config?.email || '',
    ciudad: config?.ciudad || '',
    regimenTributario: config?.regimenTributario || 'Régimen Simplificado',
    resolucionDian: config?.resolucionDian || '',
    rangoFacturacion: config?.rangoFacturacion || '',
    pieFactura: config?.pieFactura || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/configuracion', {
        method: config ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar configuración');
      }

      alert('Configuración guardada exitosamente');
      router.refresh();
    } catch (error) {
      alert('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Restaurante *
          </label>
          <input
            type="text"
            required
            value={formData.nombreRestaurante}
            onChange={(e) => setFormData({ ...formData, nombreRestaurante: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NIT *
          </label>
          <input
            type="text"
            required
            value={formData.nit}
            onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="900.123.456-7"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono *
          </label>
          <input
            type="text"
            required
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="(601) 234-5678"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dirección *
          </label>
          <input
            type="text"
            required
            value={formData.direccion}
            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Calle 123 #45-67"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ciudad *
          </label>
          <input
            type="text"
            required
            value={formData.ciudad}
            onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Bogotá D.C."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="contacto@maxcar.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Régimen Tributario *
          </label>
          <select
            required
            value={formData.regimenTributario}
            onChange={(e) => setFormData({ ...formData, regimenTributario: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="Régimen Simplificado">Régimen Simplificado</option>
            <option value="Régimen Común">Régimen Común</option>
            <option value="Gran Contribuyente">Gran Contribuyente</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resolución DIAN
          </label>
          <input
            type="text"
            value={formData.resolucionDian}
            onChange={(e) => setFormData({ ...formData, resolucionDian: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Resolución No. 123456"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rango de Facturación
          </label>
          <input
            type="text"
            value={formData.rangoFacturacion}
            onChange={(e) => setFormData({ ...formData, rangoFacturacion: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Del F-0001 al F-10000"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pie de Factura
          </label>
          <textarea
            value={formData.pieFactura}
            onChange={(e) => setFormData({ ...formData, pieFactura: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Gracias por su preferencia. ¡Vuelva pronto!"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </form>
  );
}
