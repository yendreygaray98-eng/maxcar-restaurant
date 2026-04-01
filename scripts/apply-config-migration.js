const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Aplicando migración de configuración del restaurante...');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', 'add_configuracion_restaurante.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar cada comando SQL
    const commands = sql.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        console.log('Ejecutando:', command.trim().substring(0, 50) + '...');
        await prisma.$executeRawUnsafe(command);
      }
    }
    
    console.log('✅ Migración aplicada exitosamente');
    console.log('Tabla creada: configuracion_restaurante');
    console.log('Configuración inicial de MAX CAR insertada');
    
  } catch (error) {
    console.error('❌ Error al aplicar migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
