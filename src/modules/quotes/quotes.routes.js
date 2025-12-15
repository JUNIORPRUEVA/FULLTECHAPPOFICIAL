const express = require("express");
const { getQuotes, getQuote, createQuoteHandler, updateQuote, deleteQuoteHandler } = require("./quotes.controller");
const { validate } = require("../../middlewares/validate.middleware");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { createQuoteSchema, updateQuoteSchema } = require("./quotes.schema");

const router = express.Router();

router.use(requireAuth);

router.get("/", getQuotes);
router.get("/:id", getQuote);
router.post("/", validate(createQuoteSchema), createQuoteHandler);
router.patch("/:id", validate(updateQuoteSchema), updateQuote);
router.delete("/:id", deleteQuoteHandler);

module.exports = router;