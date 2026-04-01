import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generarFacturaPDF } from '@/lib/generar-factura-pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Obtener la venta
    const venta = await prisma.pedido.findUnique({
      where: { id },
      include: {
        mesa: true,
        detalles: {
          include: {
            producto: true,
          },
        },
      },
    });

    if (!venta) {
      return NextResponse.json(
        { error: 'Venta no encontrada' },
        { status: 404 }
      );
    }

    // Obtener configuración del restaurante
    const config = await prisma.configuracionRestaurante.findFirst();

    if (!config) {
      return NextResponse.json(
        { error: 'Configuración del restaurante no encontrada' },
        { status: 404 }
      );
    }

    // Generar PDF
    const pdfStream = await generarFacturaPDF(
      JSON.parse(JSON.stringify(venta)),
      {
        nombreRestaurante: config.nombreRestaurante,
        nit: config.nit,
        direccion: config.direccion,
        telefono: config.telefono,
        email: config.email || undefined,
        ciudad: config.ciudad,
        regimenTributario: config.regimenTributario,
        resolucionDian: config.resolucionDian || undefined,
        pieFactura: config.pieFactura || undefined,
      }
    );

    // Convertir stream a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    // Retornar PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factura-${venta.numeroFactura || venta.numero}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Error generando PDF:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar PDF' },
      { status: 500 }
    );
  }
}
