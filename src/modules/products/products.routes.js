const express = require("express");
const router = express.Router();

const ctrl = require("./products.controller");
const { validate } = require("../../middlewares/validate.middleware");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { createProductSchema, updateProductSchema } = require("./products.schema");

// All routes require auth
router.use(requireAuth);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", validate(createProductSchema), ctrl.create);
router.put("/:id", validate(updateProductSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;