const express = require("express");
const router = express.Router();

const ctrl = require("./customers.controller");
const { validate } = require("../../middlewares/validate.middleware");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { createCustomerSchema, updateCustomerSchema } = require("./customers.schema");

// All routes require auth
router.use(requireAuth);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", validate(createCustomerSchema), ctrl.create);
router.put("/:id", validate(updateCustomerSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

module.exports = router;