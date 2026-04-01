import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const mesa = await prisma.mesa.findUnique({
      where: { id },
    });

    if (!mesa) {
      return NextResponse.json(
        { error: 'Mesa no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(mesa);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener mesa' },
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
