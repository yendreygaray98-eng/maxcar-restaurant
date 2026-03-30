const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creando categorías...');
  
  const categorias = [
    { codigo: 'PLF', nombre: 'Platos Fuertes', descripcion: 'Platos principales' },
    { codigo: 'ENT', nombre: 'Entradas', descripcion: 'Aperitivos y entradas' },
    { codigo: 'BEB', nombre: 'Bebidas', descripcion: 'Bebidas y refrescos' },
    { codigo: 'POS', nombre: 'Postres', descripcion: 'Postres y dulces' },
    { codigo: 'COM', nombre: 'Complementos', descripcion: 'Acompañamientos' },
  ];

  for (const cat of categorias) {
    await prisma.categoria.upsert({
      where: { codigo: cat.codigo },
      update: {},
      create: cat,
    });
  }

  console.log('Creando usuario admin...');
  
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  await prisma.usuario.upsert({
    where: { email: 'admin@maxcar.com' },
    update: {},
    create: {
      email: 'admin@maxcar.com',
      password: hashedPassword,
      nombre: 'Administrador',
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO',
    },
  });

  console.log('✓ Datos creados exitosamente');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
