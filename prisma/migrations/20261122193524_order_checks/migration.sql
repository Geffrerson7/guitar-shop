-- Restricciones que Prisma no expresa en el esquema (Fase 11). Son la última
-- red: la transacción del checkout ya descuenta el stock con
-- `UPDATE ... WHERE stock >= cantidad`, pero ningún camino (un script, el
-- panel de la Fase 13) debe poder dejarlo en negativo.
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_stock_no_negativo" CHECK ("stock" >= 0);

ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_cantidad_positiva" CHECK ("cantidad" > 0);
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_precio_no_negativo" CHECK ("precioUnitarioCentimos" >= 0);

ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_total_no_negativo" CHECK ("totalCentimos" >= 0);
