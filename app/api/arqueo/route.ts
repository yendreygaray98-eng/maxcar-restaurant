import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar que no haya una caja abierta
    const cajaAbierta = await prisma.arqueo.findFirst({
      where: { estado: 'ABIERTO' },
    });

    if (cajaAbierta) {
      return NextResponse.json(
        { error: 'Ya existe una caja abierta' },
        { status: 400 }
      );
    }

    const arqueo = await prisma.arqueo.create({
      data: {
        usuarioId: body.usuarioId,
        montoInicial: body.montoInicial,
        totalEsperado: body.montoInicial,
      },
    });

    return NextResponse.json(arqueo);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al abrir caja' },
      { status: 500 }
    );
  }
}
