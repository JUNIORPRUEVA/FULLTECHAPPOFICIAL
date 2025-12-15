const { z } = require("zod");

const registerSchema = z.object({
  nombre: z.string().min(2),
  usuario: z.string().min(3),
  email: z.string().email().optional(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  usuario: z.string().min(1),
  password: z.string().min(6),
});

module.exports = { registerSchema, loginSchema };
