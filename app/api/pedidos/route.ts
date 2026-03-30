import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generar número de pedido
    const ultimoPedido = await prisma.pedido.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    
    const numeroActual = ultimoPedido 
      ? parseInt(ultimoPedido.numero.replace('PED-', '')) 
      : 0;
    const nuevoNumero = `PED-${String(numeroActual + 1).padStart(6, '0')}`;

    // Crear pedido con detalles
    const pedido = await prisma.pedido.create({
      data: {
        numero: nuevoNumero,
        mesaId: body.mesaId,
        usuarioId: body.usuarioId,
        estado: 'PENDIENTE',
        subtotal: body.subtotal,
        cargoVip: body.cargoVip || 0,
        iva: body.iva,
        total: body.total,
        detalles: {
          create: body.detalles.map((detalle: any) => ({
            productoId: detalle.productoId,
            cantidad: detalle.cantidad,
            precioUnit: detalle.precioUnit,
            subtotal: detalle.subtotal,
            notas: detalle.notas || null,
          })),
        },
      },
      include: {
        detalles: {
          include: {
            producto: true,
          },
        },
        mesa: true,
      },
    });

    // Actualizar estado de la mesa a OCUPADA
    await prisma.mesa.update({
      where: { id: body.mesaId },
      data: { estado: 'OCUPADA' },
    });

    return NextResponse.json(pedido);
  } catch (error: any) {
    console.error('Error al crear pedido:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear pedido' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        mesa: true,
        detalles: {
          include: {
            producto: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(pedidos);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener pedidos' },
      { status: 500 }
    );
  }
}
