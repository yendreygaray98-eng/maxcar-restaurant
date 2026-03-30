import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const arqueoActivo = await prisma.arqueo.findFirst({
      where: { estado: 'ABIERTO' },
      orderBy: { fechaApertura: 'desc' },
    });

    if (!arqueoActivo) {
      return NextResponse.json(null);
    }

    return NextResponse.json(arqueoActivo);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener arqueo' },
      { status: 500 }
    );
  }
}
