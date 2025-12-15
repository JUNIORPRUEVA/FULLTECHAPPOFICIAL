const { z } = require("zod");

const quoteItemSchema = z.object({
  producto_id: z.number().int(),
  cantidad: z.number().int().positive(),
});

const createQuoteSchema = z.object({
  cliente_id: z.number().int().optional(),
  fecha_vencimiento: z.string().optional(),
  items: z.array(quoteItemSchema).min(1),
  notas: z.string().optional(),
});

const updateQuoteSchema = z.object({
  estado: z.enum(["pendiente", "aprobada", "rechazada", "expirada"]),
});

module.exports = { createQuoteSchema, updateQuoteSchema };