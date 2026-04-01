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

    const diferencia = Number(body.montoReal) - Number(arqueoActual.totalEsperado);

    const arqueo = await prisma.arqueo.update({
      where: { id },
      data: {
        usuarioCierreId: body.usuarioCierreId,
        montoReal: body.montoReal,
        diferencia,
        observaciones: body.observaciones,
        estado: 'CERRADO',
        fechaCierre: new Date(),
        // Desglose de billetes y monedas
        billetes100k: body.billetes100k || 0,
        billetes50k: body.billetes50k || 0,
        billetes20k: body.billetes20k || 0,
        billetes10k: body.billetes10k || 0,
        billetes5k: body.billetes5k || 0,
        billetes2k: body.billetes2k || 0,
        billetes1k: body.billetes1k || 0,
        monedas1k: body.monedas1k || 0,
        monedas500: body.monedas500 || 0,
        monedas200: body.monedas200 || 0,
        monedas100: body.monedas100 || 0,
        monedas50: body.monedas50 || 0,
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
