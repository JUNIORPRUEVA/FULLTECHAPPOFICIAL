const express = require("express");
const router = express.Router();

const ctrl = require("./sales.controller");
const { validate } = require("../../middlewares/validate.middleware");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { createSaleSchema } = require("./sales.schema");

// All routes require auth
router.use(requireAuth);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", validate(createSaleSchema), ctrl.create);
router.delete("/:id", ctrl.remove);

module.exports = router;