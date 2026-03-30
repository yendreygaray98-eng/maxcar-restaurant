const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  try {
    const cajeroExistente = await prisma.usuario.findFirst({
      where: { rol: 'CAJERO' }
    });

    if (cajeroExistente) {
      console.log('Ya existe un usuario cajero:', cajeroExistente.email);
      return;
    }

    const hashedPassword = await bcrypt.hash('cajero123', 10);
    
    const cajero = await prisma.usuario.create({
      data: {
        email: 'cajero@maxcar.com',
        password: hashedPassword,
        nombre: 'Cajero Principal',
        rol: 'CAJERO',
        estado: 'ACTIVO',
      },
    });

    console.log('✅ Usuario cajero creado exitosamente:');
    console.log('Email:', cajero.email);
    console.log('Password: cajero123');
    console.log('Rol:', cajero.rol);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
