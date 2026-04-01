require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEmpanada() {
  try {
    const producto = await prisma.producto.findFirst({
      where: {
        codigo: 'ENT-001'
      }
    });

    if (producto) {
      await prisma.producto.update({
        where: { id: producto.id },
        data: { imagen: '/productos/Empanada_pollo.jpg' }
      });
      console.log('✓ Imagen de empanada actualizada');
    } else {
      console.log('✗ No se encontró el producto');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEmpanada();
