-- Agregar campos de comprobantes de pago a pedidos
ALTER TABLE pedidos ADD COLUMN referencia_transaccion VARCHAR(255);
ALTER TABLE pedidos ADD COLUMN ultimos_4_digitos VARCHAR(4);
ALTER TABLE pedidos ADD COLUMN notas_pago TEXT;

-- Agregar campos de desglose de billetes y monedas a arqueos
ALTER TABLE arqueos ADD COLUMN usuario_cierre_id VARCHAR(255);
ALTER TABLE arqueos ADD COLUMN billetes_100k INTEGER DEFAULT 0;
ALTER TABLE arqueos ADD COLUMN billetes_50k INTEGER DEFAULT 0;
ALTER TABLE arqueos ADD COLUMN billetes_20k INTEGER DEFAULT 0;
ALTER TABLE arqueos ADD COLUMN billetes_10k INTEGER DEFAULT 0;
ALTER TABLE arqueos ADD COLUMN billetes_5k INTEGER DEFAULT 0;
ALTER TABLE arqueos ADD COLUMN billetes_2k INTEGER DEFAULT 0;
ALTER TABLE arqueos ADD COLUMN billetes_1k INTEGER DEFAULT 0;
ALTER TABLE arqueos ADD COLUMN monedas_1k INTEGER DEFAULT 0;
ALTER TABLE arqueos ADD COLUMN monedas_500 INTEGER DEFAULT 0;
ALTER TABLE arqueos ADD COLUMN monedas_200 INTEGER DEFAULT 0;
ALTER TABLE arqueos ADD COLUMN monedas_100 INTEGER DEFAULT 0;
ALTER TABLE arqueos ADD COLUMN monedas_50 INTEGER DEFAULT 0;
