import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Crear usuario administrador
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.usuario.upsert({
      where: { email: 'admin@maxcar.com' },
      update: {},
      create: {
        email: 'admin@maxcar.com',
        password: adminPassword,
        nombre: 'Administrador',
        rol: 'ADMINISTRADOR',
      },
    });

    // Crear categorías
    const categorias = [
      { codigo: 'PLF', nombre: 'Platos Fuertes' },
      { codigo: 'ENT', nombre: 'Entradas' },
      { codigo: 'BEB', nombre: 'Bebidas' },
      { codigo: 'POS', nombre: 'Postres' },
      { codigo: 'COM', nombre: 'Combos' },
    ];

    for (const cat of categorias) {
      await prisma.categoria.upsert({
        where: { codigo: cat.codigo },
        update: {},
        create: cat,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario admin y categorías creados',
      admin: { email: admin.email, nombre: admin.nombre },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
