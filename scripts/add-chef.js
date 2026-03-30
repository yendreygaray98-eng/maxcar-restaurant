const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar si ya existe un chef
    const chefExistente = await prisma.usuario.findFirst({
      where: { rol: 'CHEF' }
    });

    if (chefExistente) {
      console.log('Ya existe un usuario chef:', chefExistente.email);
      return;
    }

    // Crear usuario chef
    const hashedPassword = await bcrypt.hash('chef123', 10);
    
    const chef = await prisma.usuario.create({
      data: {
        email: 'chef@maxcar.com',
        password: hashedPassword,
        nombre: 'Chef Principal',
        rol: 'CHEF',
        estado: 'ACTIVO',
      },
    });

    console.log('✅ Usuario chef creado exitosamente:');
    console.log('Email:', chef.email);
    console.log('Password: chef123');
    console.log('Rol:', chef.rol);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
