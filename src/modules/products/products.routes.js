const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const ctrl = require("./products.controller");
const { validate } = require("../../middlewares/validate.middleware");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { createProductSchema, updateProductSchema } = require("./products.schema");

// Crear UPLOAD_DIR y PRODUCTS_DIR
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
const PRODUCTS_DIR = path.join(UPLOAD_DIR, "products");
fs.mkdirSync(PRODUCTS_DIR, { recursive: true });

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PRODUCTS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext || ".jpg";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes: jpeg, jpg, png, webp'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// All routes require auth
router.use(requireAuth);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", upload.single('image'), validate(createProductSchema), ctrl.create);
router.put("/:id", upload.single('image'), validate(updateProductSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;