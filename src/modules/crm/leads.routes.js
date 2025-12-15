const express = require("express");
const router = express.Router();

const ctrl = require("./leads.controller");
const { validate } = require("../../middlewares/validate.middleware");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { createLeadSchema, updateLeadSchema } = require("./leads.schema");

// All routes require auth
router.use(requireAuth);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", validate(createLeadSchema), ctrl.create);
router.put("/:id", validate(updateLeadSchema), ctrl.update);
router.delete("/:id", ctrl.remove);
router.post("/:id/convert", ctrl.convertToCustomer);

module.exports = router;