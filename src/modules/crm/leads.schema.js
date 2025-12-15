const { z } = require("zod");

const createLeadSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  empresa: z.string().optional(),
  fuente: z.string().optional(), // web, referido, etc.
  notas: z.string().optional(),
});

const updateLeadSchema = z.object({
  nombre: z.string().min(1).optional(),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  empresa: z.string().optional(),
  fuente: z.string().optional(),
  status: z.enum(['nuevo', 'contactado', 'calificado', 'cerrado', 'perdido']).optional(),
  notas: z.string().optional(),
});

module.exports = { createLeadSchema, updateLeadSchema };