import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const producto = await prisma.producto.update({
      where: { id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        precio: body.precio,
        categoriaId: body.categoriaId,
        stockMinimo: body.stockMinimo,
      },
      include: {
        categoria: true,
      },
    });

    return NextResponse.json(producto);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar si el producto tiene pedidos asociados
    const pedidosConProducto = await prisma.detallePedido.count({
      where: { productoId: id },
    });

    if (pedidosConProducto > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el producto porque tiene pedidos asociados' },
        { status: 400 }
      );
    }

    await prisma.producto.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Producto eliminado exitosamente' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al eliminar producto' },
      { status: 500 }
    );
  }
}
