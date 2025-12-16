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

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads', 'products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir archivos estáticos de uploads (público, sin auth)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
