-- Agregar campos de facturación al modelo Pedido
ALTER TABLE pedidos ADD COLUMN numero_factura VARCHAR(255);
ALTER TABLE pedidos ADD COLUMN cliente_nombre VARCHAR(255);
ALTER TABLE pedidos ADD COLUMN cliente_documento VARCHAR(255);

-- Crear índice único para numero_factura (permitiendo NULL)
CREATE UNIQUE INDEX pedidos_numero_factura_key ON pedidos(numero_factura) WHERE numero_factura IS NOT NULL;
