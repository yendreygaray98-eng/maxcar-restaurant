-- Agregar rol DOMICILIARIO
ALTER TYPE "Rol" ADD VALUE IF NOT EXISTS 'DOMICILIARIO';

-- Agregar estado EN_CAMINO para pedidos
ALTER TYPE "EstadoPedido" ADD VALUE IF NOT EXISTS 'EN_CAMINO';

-- Agregar tipo de pedido
CREATE TYPE "TipoPedido" AS ENUM ('MESA', 'DOMICILIO');

-- Agregar campos para domicilios en pedidos
ALTER TABLE pedidos ADD COLUMN tipo_pedido "TipoPedido" DEFAULT 'MESA';
ALTER TABLE pedidos ADD COLUMN direccion_entrega TEXT;
ALTER TABLE pedidos ADD COLUMN telefono_cliente VARCHAR(20);
ALTER TABLE pedidos ADD COLUMN domiciliario_id VARCHAR(255);
ALTER TABLE pedidos ADD COLUMN fecha_asignacion TIMESTAMP;
ALTER TABLE pedidos ADD COLUMN fecha_entrega TIMESTAMP;

-- Hacer mesaId opcional para domicilios
ALTER TABLE pedidos ALTER COLUMN mesa_id DROP NOT NULL;
