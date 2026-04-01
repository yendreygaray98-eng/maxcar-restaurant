import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #333',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '1 solid #333',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e0e0e0',
  },
  col1: { width: '10%' },
  col2: { width: '45%' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 10,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
    paddingTop: 5,
    borderTop: '2 solid #333',
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1 solid #e0e0e0',
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
  },
  disclaimer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff3cd',
    border: '1 solid #ffc107',
    borderRadius: 4,
    fontSize: 8,
    textAlign: 'center',
  },
});

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

interface Producto {
  nombre: string;
}

interface DetalleVenta {
  cantidad: number;
  producto: Producto;
  precioUnit: number;
  subtotal: number;
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
  detalles: DetalleVenta[];
}

interface Props {
  venta: Venta;
  config: ConfigRestaurante;
}

export const FacturaPDF: React.FC<Props> = ({ venta, config }) => {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearMoneda = (valor: number) => {
    return `$${valor.toLocaleString('es-CO')}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{config.nombreRestaurante}</Text>
          <Text style={styles.subtitle}>NIT: {config.nit}</Text>
          <Text style={styles.subtitle}>{config.direccion}</Text>
          <Text style={styles.subtitle}>{config.ciudad}</Text>
          <Text style={styles.subtitle}>Tel: {config.telefono}</Text>
          {config.email && <Text style={styles.subtitle}>Email: {config.email}</Text>}
          <Text style={styles.subtitle}>{config.regimenTributario}</Text>
        </View>

        {/* Tipo de documento */}
        <View style={{ marginBottom: 15, textAlign: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            {venta.numeroFactura ? 'DOCUMENTO EQUIVALENTE POS' : 'TICKET DE VENTA'}
          </Text>
          {venta.numeroFactura && (
            <Text style={{ fontSize: 14, marginTop: 5 }}>
              No. {venta.numeroFactura}
            </Text>
          )}
        </View>

        {/* Información de la venta */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Fecha y Hora:</Text>
            <Text style={styles.value}>{formatearFecha(venta.createdAt)}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Pedido No:</Text>
            <Text style={styles.value}>{venta.numero}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.label}>Mesa:</Text>
            <Text style={styles.value}>
              #{venta.mesa.numero} {venta.mesa.tipo === 'VIP' ? '(VIP)' : ''}
            </Text>
          </View>
        </View>

        {/* Información del cliente */}
        {venta.clienteNombre && (
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Cliente:</Text>
              <Text style={styles.value}>{venta.clienteNombre}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Documento:</Text>
              <Text style={styles.value}>{venta.clienteDocumento}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Método de Pago:</Text>
              <Text style={styles.value}>{venta.metodoPago}</Text>
            </View>
          </View>
        )}

        {/* Tabla de productos */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Cant.</Text>
            <Text style={styles.col2}>Descripción</Text>
            <Text style={styles.col3}>Precio Unit.</Text>
            <Text style={styles.col4}>Subtotal</Text>
          </View>
          {venta.detalles.map((detalle, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{detalle.cantidad}</Text>
              <Text style={styles.col2}>{detalle.producto.nombre}</Text>
              <Text style={styles.col3}>{formatearMoneda(Number(detalle.precioUnit))}</Text>
              <Text style={styles.col4}>{formatearMoneda(Number(detalle.subtotal))}</Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatearMoneda(Number(venta.subtotal))}</Text>
          </View>
          {Number(venta.cargoVip) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Cargo VIP:</Text>
              <Text style={styles.totalValue}>{formatearMoneda(Number(venta.cargoVip))}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (19%):</Text>
            <Text style={styles.totalValue}>{formatearMoneda(Number(venta.iva))}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotal}>TOTAL:</Text>
            <Text style={styles.grandTotal}>{formatearMoneda(Number(venta.total))}</Text>
          </View>
        </View>

        {/* Disclaimer legal */}
        <View style={styles.disclaimer}>
          <Text>
            DOCUMENTO EQUIVALENTE - NO VÁLIDO COMO FACTURA ELECTRÓNICA
          </Text>
          <Text style={{ marginTop: 5 }}>
            Este documento no tiene validez fiscal ante la DIAN
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {config.pieFactura && <Text>{config.pieFactura}</Text>}
          <Text style={{ marginTop: 5 }}>
            Sistema de Gestión MAX CAR - {new Date().getFullYear()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default FacturaPDF;
