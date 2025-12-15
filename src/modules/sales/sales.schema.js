const { z } = require("zod");

const createSaleSchema = z.object({
  cliente_id: z.number().int().optional(),
  monto_total: z.number().positive(),
  tipo_venta: z.string().optional(),
  forma_pago: z.string().optional(),
  notas: z.string().optional(),
});

module.exports = { createSaleSchema };