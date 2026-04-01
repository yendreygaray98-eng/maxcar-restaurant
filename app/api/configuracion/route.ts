import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Buscar configuración existente
    const configExistente = await prisma.configuracionRestaurante.findFirst();

    if (!configExistente) {
      return NextResponse.json(
        { error: 'Configuración no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar configuración
    const config = await prisma.configuracionRestaurante.update({
      where: { id: configExistente.id },
      data: {
        nombreRestaurante: body.nombreRestaurante,
        nit: body.nit,
        direccion: body.direccion,
        telefono: body.telefono,
        email: body.email || null,
        ciudad: body.ciudad,
        regimenTributario: body.regimenTributario,
        resolucionDian: body.resolucionDian || null,
        rangoFacturacion: body.rangoFacturacion || null,
        pieFactura: body.pieFactura || null,
      },
    });

    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar configuración' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Crear nueva configuración
    const config = await prisma.configuracionRestaurante.create({
      data: {
        nombreRestaurante: body.nombreRestaurante,
        nit: body.nit,
        direccion: body.direccion,
        telefono: body.telefono,
        email: body.email || null,
        ciudad: body.ciudad,
        regimenTributario: body.regimenTributario,
        resolucionDian: body.resolucionDian || null,
        rangoFacturacion: body.rangoFacturacion || null,
        pieFactura: body.pieFactura || null,
      },
    });

    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear configuración' },
      { status: 500 }
    );
  }
}
