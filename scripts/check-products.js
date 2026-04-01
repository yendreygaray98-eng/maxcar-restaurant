require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const productos = await prisma.producto.findMany({
      select: {
        id: true,
        codigo: true,
        nombre: true,
        imagen: true
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    console.log('\nProductos en la base de datos:\n');
    productos.forEach(p => {
      console.log(`${p.codigo} - ${p.nombre}`);
      console.log(`  Imagen: ${p.imagen || 'SIN IMAGEN'}\n`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
