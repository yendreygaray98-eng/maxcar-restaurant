require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateProductImages() {
  try {
    // Mapeo de nombres de productos a archivos de imagen
    const imageMap = {
      'Bandeja Paisa': '/productos/Bandeja_paisa.jpg',
      'Cerveza Águila': '/productos/Cerveza_aguila.jpg',
      'Empanada de Pollo': '/productos/Empanada_pollo.jpg',
      'Ensalada de Pollo': '/productos/Ensalada_de_pollo.jpg',
      'Obleas con Arequipe': '/productos/Obleas_arequipe.jpg',
    };

    console.log('Actualizando imágenes de productos...\n');

    for (const [nombreProducto, rutaImagen] of Object.entries(imageMap)) {
      const producto = await prisma.producto.findFirst({
        where: {
          nombre: {
            contains: nombreProducto,
            mode: 'insensitive'
          }
        }
      });

      if (producto) {
        await prisma.producto.update({
          where: { id: producto.id },
          data: { imagen: rutaImagen }
        });
        console.log(`✓ ${nombreProducto} -> ${rutaImagen}`);
      } else {
        console.log(`✗ No se encontró: ${nombreProducto}`);
      }
    }

    console.log('\n¡Imágenes actualizadas correctamente!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductImages();
