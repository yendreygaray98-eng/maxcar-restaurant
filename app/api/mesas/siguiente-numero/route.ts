import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const ultimaMesa = await prisma.mesa.findFirst({
      orderBy: {
        numero: 'desc',
      },
    });

    const siguienteNumero = ultimaMesa ? ultimaMesa.numero + 1 : 1;

    return NextResponse.json({ numero: siguienteNumero });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al obtener siguiente número' },
      { status: 500 }
    );
  }
}
