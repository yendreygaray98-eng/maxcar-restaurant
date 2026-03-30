import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Obtener el pedido antes de actualizar para comparar estados
    const pedidoAnterior = await prisma.pedido.findUnique({
      where: { id },
      include: {
        detalles: {
          include: {
            producto: {
              include: {
                categoria: true,
              },
            },
          },
        },
      },
    });

    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
        estado: body.estado,
        metodoPago: body.metodoPago || undefined,
      },
      include: {
        mesa: true,
        detalles: {
          include: {
            producto: {
              include: {
                categoria: true,
              },
            },
          },
        },
      },
    });

    // Lógica de stock: SE RESTA CUANDO EL CAJERO COBRA (ENTREGADO)
    if (body.estado === 'ENTREGADO') {
      // Restar stock de bebidas cuando se completa la venta
      for (const detalle of pedido.detalles) {
        if (detalle.producto.categoria.codigo === 'BEB' && detalle.producto.stockActual !== null) {
          await prisma.producto.update({
            where: { id: detalle.producto.id },
            data: {
              stockActual: {
                decrement: detalle.cantidad,
              },
            },
          });
        }
      }

      // Actualizar arqueo de caja activo (si existe)
      if (body.metodoPago) {
        const arqueoActivo = await prisma.arqueo.findFirst({
          where: { estado: 'ABIERTO' },
          orderBy: { fechaApertura: 'desc' },
        });

        if (arqueoActivo) {
          const total = Number(pedido.total);
          const updates: any = {};

          if (body.metodoPago === 'EFECTIVO') {
            updates.ventasEfectivo = { increment: total };
          } else if (body.metodoPago === 'TARJETA') {
            updates.ventasTarjeta = { increment: total };
          } else if (body.metodoPago === 'TRANSFERENCIA') {
            updates.ventasTransfer = { increment: total };
          }

          // Calcular total esperado (base + efectivo)
          const nuevoEfectivo = Number(arqueoActivo.ventasEfectivo) + (body.metodoPago === 'EFECTIVO' ? total : 0);
          updates.totalEsperado = Number(arqueoActivo.montoInicial) + nuevoEfectivo;

          await prisma.arqueo.update({
            where: { id: arqueoActivo.id },
            data: updates,
          });
        }
      }

      // Liberar la mesa
      await prisma.mesa.update({
        where: { id: pedido.mesaId },
        data: { estado: 'LIBRE' },
      });
    }

    // Si se cancela el pedido, no se resta nada (nunca se restó)
    if (body.estado === 'CANCELADO') {
      // Liberar la mesa si estaba ocupada
      await prisma.mesa.update({
        where: { id: pedido.mesaId },
        data: { estado: 'LIBRE' },
      });
    }

    return NextResponse.json(pedido);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar pedido' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Agregar nuevos productos al pedido existente
    const pedidoActual = await prisma.pedido.findUnique({
      where: { id },
      include: {
        detalles: true,
      },
    });

    if (!pedidoActual) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Crear los nuevos detalles
    await prisma.detallePedido.createMany({
      data: body.detalles.map((d: any) => ({
        pedidoId: id,
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnit: d.precioUnit,
        subtotal: d.subtotal,
        notas: d.notas || '',
      })),
    });

    // Recalcular totales
    const todosLosDetalles = await prisma.detallePedido.findMany({
      where: { pedidoId: id },
    });

    const subtotal = todosLosDetalles.reduce((sum, d) => sum + Number(d.subtotal), 0);
    const cargoVip = Number(pedidoActual.cargoVip);
    const iva = (subtotal + cargoVip) * 0.19;
    const total = subtotal + cargoVip + iva;

    const pedidoActualizado = await prisma.pedido.update({
      where: { id },
      data: {
        subtotal,
        iva,
        total,
      },
      include: {
        mesa: true,
        detalles: {
          include: {
            producto: true,
          },
        },
      },
    });

    return NextResponse.json(pedidoActualizado);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar pedido' },
      { status: 500 }
    );
  }
}

