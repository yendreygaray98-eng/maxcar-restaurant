const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Aplicando migración de arqueo mejorado...');
    
    const sqlPath = path.join(__dirname, '..', 'prisma', 'migrations', 'add_arqueo_mejorado.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    const commands = sql.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        console.log('Ejecutando:', command.trim().substring(0, 50) + '...');
        await prisma.$executeRawUnsafe(command);
      }
    }
    
    console.log('✅ Migración aplicada exitosamente');
    console.log('Campos agregados a pedidos:');
    console.log('  - referencia_transaccion');
    console.log('  - ultimos_4_digitos');
    console.log('  - notas_pago');
    console.log('Campos agregados a arqueos:');
    console.log('  - usuario_cierre_id');
    console.log('  - Desglose de billetes (100k, 50k, 20k, 10k, 5k, 2k, 1k)');
    console.log('  - Desglose de monedas (1k, 500, 200, 100, 50)');
    
  } catch (error) {
    console.error('❌ Error al aplicar migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
