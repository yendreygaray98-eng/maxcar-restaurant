require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Agregando columna cargo_vip a la tabla pedidos...');
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE pedidos 
      ADD COLUMN IF NOT EXISTS cargo_vip DECIMAL(10,2) DEFAULT 0 NOT NULL;
    `);
    
    console.log('✓ Columna cargo_vip agregada exitosamente');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
