import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const producto = await prisma.producto.create({
      data: {
        codigo: body.codigo,
        nombre: body.nombre,
        descripcion: body.descripcion,
        precio: body.precio,
        imagen: body.imagen,
        stockActual: body.stockActual,
        stockMinimo: body.stockMinimo,
        categoriaId: body.categoriaId,
      },
      include: {
        categoria: true,
      },
    });

    return NextResponse.json(producto);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear producto' },
      { status: 500 }
    );
  }
}
