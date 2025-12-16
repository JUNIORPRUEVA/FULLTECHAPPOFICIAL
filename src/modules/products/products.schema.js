const { z } = require("zod");

const createProductSchema = z.object({
  nombre: z.string().min(1),
  categoria: z.string().optional(),
  costo: z.number().min(0).optional(),
  precio: z.number().min(0).optional(),
  cantidad: z.number().int().min(0).default(0),
  codigo_barra: z.string().optional(),
  imagen_url: z.string().optional(),
  estado: z.string().optional(),
});

const updateProductSchema = z.object({
  nombre: z.string().min(1).optional(),
  categoria: z.string().optional(),
  costo: z.number().min(0).optional(),
  precio: z.number().min(0).optional(),
  cantidad: z.number().int().min(0).optional(),
  codigo_barra: z.string().optional(),
  imagen_url: z.string().optional(),
  estado: z.string().optional(),
});

module.exports = { createProductSchema, updateProductSchema };