const express = require("express");
const router = express.Router();

const ctrl = require("./activities.controller");
const { validate } = require("../../middlewares/validate.middleware");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { createActivitySchema } = require("./activities.schema");

// All routes require auth
router.use(requireAuth);

router.get("/leads/:leadId/activities", ctrl.getForLead);
router.post("/leads/:leadId/activities", validate(createActivitySchema), ctrl.create);
router.delete("/activities/:id", ctrl.remove);

module.exports = router;