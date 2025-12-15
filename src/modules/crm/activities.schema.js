const { z } = require("zod");

const createActivitySchema = z.object({
  tipo: z.enum(['llamada', 'email', 'reunion', 'nota']),
  descripcion: z.string().min(1),
  fecha: z.string().optional(), // ISO date
});

module.exports = { createActivitySchema };