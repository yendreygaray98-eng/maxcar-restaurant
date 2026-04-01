-- Crear tabla de configuración del restaurante
CREATE TABLE configuracion_restaurante (
  id VARCHAR(255) PRIMARY KEY,
  nombre_restaurante VARCHAR(255) NOT NULL,
  nit VARCHAR(255) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  telefono VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  ciudad VARCHAR(255) NOT NULL,
  regimen_tributario VARCHAR(255) DEFAULT 'Régimen Simplificado',
  resolucion_dian TEXT,
  rango_facturacion VARCHAR(255),
  logo_url TEXT,
  pie_factura TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar configuración inicial de MAX CAR
INSERT INTO configuracion_restaurante (
  id,
  nombre_restaurante,
  nit,
  direccion,
  telefono,
  ciudad,
  regimen_tributario,
  pie_factura
) VALUES (
  gen_random_uuid()::text,
  'MAX CAR RESTAURANT',
  '900.123.456-7',
  'Calle 123 #45-67',
  '(601) 234-5678',
  'Bogotá D.C.',
  'Régimen Simplificado',
  'Gracias por su preferencia. ¡Vuelva pronto!'
);
