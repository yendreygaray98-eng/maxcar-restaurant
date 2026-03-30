import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar si el número de mesa ya existe
    const existente = await prisma.mesa.findUnique({
      where: { numero: body.numero },
    });

    if (existente) {
      return NextResponse.json(
        { error: 'El número de mesa ya existe' },
        { status: 400 }
      );
    }

    const mesa = await prisma.mesa.create({
      data: {
        numero: body.numero,
        tipo: body.tipo,
        capacidad: body.capacidad,
        estado: 'LIBRE',
      },
    });

    return NextResponse.json(mesa);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear mesa' },
      { status: 500 }
    );
  }
}
