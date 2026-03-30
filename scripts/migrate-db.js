const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

console.log('🔄 Aplicando cambios a la base de datos...');

try {
  execSync('npx prisma db push', {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('✅ Base de datos actualizada exitosamente');
} catch (error) {
  console.error('❌ Error al actualizar la base de datos:', error.message);
  process.exit(1);
}
