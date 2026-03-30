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
        stockActual: body.stockActual,
      },
      include: {
        categoria: true,
      },
    });

    return NextResponse.json(producto);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar inventario' },
      { status: 500 }
    );
  }
}
