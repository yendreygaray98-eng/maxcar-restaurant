import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoriaId = searchParams.get('categoriaId');

    if (!categoriaId) {
      return NextResponse.json(
        { error: 'categoriaId es requerido' },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id: categoriaId },
    });

    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    const ultimoProducto = await prisma.producto.findFirst({
      where: {
        categoriaId: categoriaId,
      },
      orderBy: {
        codigo: 'desc',
      },
    });

    let siguienteNumero = 1;
    if (ultimoProducto) {
      const match = ultimoProducto.codigo.match(/\d+$/);
      if (match) {
        siguienteNumero = parseInt(match[0]) + 1;
      }
    }

    const codigo = `${categoria.codigo}-${siguienteNumero.toString().padStart(3, '0')}`;

    return NextResponse.json({ codigo });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al generar código' },
      { status: 500 }
    );
  }
}
