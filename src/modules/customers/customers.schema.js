const { z } = require("zod");

const createCustomerSchema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().min(1),
  email: z.string().email().optional(),
  direccion: z.string().optional(),
  tipo: z.string().optional(),
  categoria: z.string().optional(),
  estado: z.string().optional(),
});

const updateCustomerSchema = z.object({
  nombre: z.string().min(1).optional(),
  telefono: z.string().min(1).optional(),
  email: z.string().email().optional(),
  direccion: z.string().optional(),
  tipo: z.string().optional(),
  categoria: z.string().optional(),
  estado: z.string().optional(),
});

module.exports = { createCustomerSchema, updateCustomerSchema };