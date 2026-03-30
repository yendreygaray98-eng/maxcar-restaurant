const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
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

  console.log('✅ Usuario admin creado:', admin.email);

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

  console.log('✅ Categorías creadas');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
