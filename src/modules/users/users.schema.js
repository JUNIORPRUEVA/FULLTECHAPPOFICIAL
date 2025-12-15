const { z } = require("zod");

const createUserSchema = z.object({
  nombre: z.string().min(2),
  usuario: z.string().min(3),
  email: z.string().email().optional(),
  password: z.string().min(6),
  rol: z.enum(["admin", "user"]).default("user"),
});

const updateUserSchema = z.object({
  nombre: z.string().min(2).optional(),
  usuario: z.string().min(3).optional(),
  email: z.string().email().optional(),
  rol: z.enum(["admin", "user"]).optional(),
  activo: z.boolean().optional(),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

module.exports = { createUserSchema, updateUserSchema, changePasswordSchema };