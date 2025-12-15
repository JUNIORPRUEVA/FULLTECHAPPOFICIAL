const express = require("express");
const router = express.Router();

const ctrl = require("./users.controller");
const { validate } = require("../../middlewares/validate.middleware");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { createUserSchema, updateUserSchema, changePasswordSchema } = require("./users.schema");

// All routes require auth
router.use(requireAuth);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", validate(createUserSchema), ctrl.create);
router.put("/:id", validate(updateUserSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

// Change password for current user
router.post("/change-password", validate(changePasswordSchema), ctrl.changePassword);

module.exports = router;