import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const mesa = await prisma.mesa.update({
      where: { id },
      data: {
        tipo: body.tipo,
        capacidad: body.capacidad,
        estado: body.estado,
      },
    });

    return NextResponse.json(mesa);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar mesa' },
      { status: 500 }
    );
  }
}
