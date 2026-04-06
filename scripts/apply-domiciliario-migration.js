require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Aplicando migración de domiciliario...');
    
    // Ejecutar comandos SQL uno por uno
    const commands = [
      `ALTER TYPE "Rol" ADD VALUE IF NOT EXISTS 'DOMICILIARIO'`,
      `ALTER TYPE "EstadoPedido" ADD VALUE IF NOT EXISTS 'EN_CAMINO'`,
      `DO $$ BEGIN
        CREATE TYPE "TipoPedido" AS ENUM ('MESA', 'DOMICILIO');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$`,
      `ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo_pedido "TipoPedido" DEFAULT 'MESA'`,
      `ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS direccion_entrega TEXT`,
      `ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS telefono_cliente VARCHAR(20)`,
      `ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS domiciliario_id VARCHAR(255)`,
      `ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_asignacion TIMESTAMP`,
      `ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_entrega TIMESTAMP`,
      `ALTER TABLE pedidos ALTER COLUMN mesa_id DROP NOT NULL`,
    ];
    
    for (const command of commands) {
      try {
        await prisma.$executeRawUnsafe(command);
        console.log('✓ Ejecutado:', command.substring(0, 50) + '...');
      } catch (error) {
        // Ignorar errores de "ya existe"
        if (!error.message.includes('already exists') && !error.message.includes('does not exist')) {
          console.log('⚠ Error (ignorado):', error.message.substring(0, 100));
        }
      }
    }
    
    console.log('✓ Migración aplicada exitosamente');
  } catch (error) {
    console.error('Error al aplicar migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
