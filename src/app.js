const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");

const { errorMiddleware } = require("./middlewares/error.middleware");
const authRoutes = require("./modules/auth/auth.routes");
const usersRoutes = require("./modules/users/users.routes");
const productsRoutes = require("./modules/products/products.routes");
const customersRoutes = require("./modules/customers/customers.routes");
const salesRoutes = require("./modules/sales/sales.routes");
const crmRoutes = require("./modules/crm/crm.routes");
const quotesRoutes = require("./modules/quotes/quotes.routes");
const backupRoutes = require("./modules/backup/backup.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Configurar directorio de uploads desde variable de entorno
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

// Crear directorios (importante el recursive:true)
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(path.join(UPLOAD_DIR, "products"), { recursive: true });
console.log(`📁 Directorio de uploads creado: ${UPLOAD_DIR}/products`);

// Servir archivos estáticos de uploads (público, sin auth)
app.use("/uploads", express.static(UPLOAD_DIR));
console.log(`📂 Sirviendo archivos estáticos desde: ${UPLOAD_DIR}`);

// Health check
app.get("/", (req, res) => res.json({ ok: true, service: "fulltech-backend" }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/crm", crmRoutes);
app.use("/api/quotes", quotesRoutes);
app.use("/api/backup", backupRoutes);

// Errors
app.use(errorMiddleware);

module.exports = app;
