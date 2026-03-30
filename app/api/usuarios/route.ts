import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar si el email ya existe
    const existente = await prisma.usuario.findUnique({
      where: { email: body.email },
    });

    if (existente) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email: body.email,
        nombre: body.nombre,
        password: hashedPassword,
        rol: body.rol,
        estado: body.estado,
      },
    });

    return NextResponse.json({
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      estado: usuario.estado,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
