import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const arqueoActual = await prisma.arqueo.findUnique({ where: { id } });
    
    if (!arqueoActual) {
      return NextResponse.json(
        { error: 'Arqueo no encontrado' },
        { status: 404 }
      );
    }

    const diferencia = body.montoReal - arqueoActual.totalEsperado;

    const arqueo = await prisma.arqueo.update({
      where: { id },
      data: {
        montoReal: body.montoReal,
        diferencia,
        observaciones: body.observaciones,
        estado: 'CERRADO',
        fechaCierre: new Date(),
      },
    });

    return NextResponse.json(arqueo);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al cerrar caja' },
      { status: 500 }
    );
  }
}
