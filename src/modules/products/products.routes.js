const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const ctrl = require("./products.controller");
const { validate } = require("../../middlewares/validate.middleware");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { createProductSchema, updateProductSchema } = require("./products.schema");

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadPath = isProduction ? '/app/uploads/products' : path.join(__dirname, '../../uploads/products');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = uuidv4().substring(0, 8);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}_${random}${ext}`);
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