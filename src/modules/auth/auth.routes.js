const express = require("express");
const router = express.Router();

const ctrl = require("./auth.controller");
const { validate } = require("../../middlewares/validate.middleware");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { registerSchema, loginSchema } = require("./auth.schema");

router.post("/register", validate(registerSchema), ctrl.register);
router.post("/login", validate(loginSchema), ctrl.login);
router.get("/profile", requireAuth, ctrl.profile);

module.exports = router;
