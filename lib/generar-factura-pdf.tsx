import { renderToStream } from '@react-pdf/renderer';
import FacturaPDF from '@/components/factura/FacturaPDF';

interface ConfigRestaurante {
  nombreRestaurante: string;
  nit: string;
  direccion: string;
  telefono: string;
  email?: string;
  ciudad: string;
  regimenTributario: string;
  resolucionDian?: string;
  pieFactura?: string;
}

interface Venta {
  numero: string;
  numeroFactura?: string;
  clienteNombre?: string;
  clienteDocumento?: string;
  createdAt: string;
  metodoPago: string;
  subtotal: number;
  cargoVip: number;
  iva: number;
  total: number;
  mesa: {
    numero: number;
    tipo: string;
  };
  detalles: any[];
}

export async function generarFacturaPDF(venta: Venta, config: ConfigRestaurante) {
  return await renderToStream(
    <FacturaPDF venta={venta} config={config} />
  );
}
