const asyncHandler = require("../../utils/asyncHandler");
const { getAllQuotes, getQuoteById, createQuote, updateQuoteStatus, deleteQuote } = require("./quotes.service");

const getQuotes = asyncHandler(async (req, res) => {
  const quotes = await getAllQuotes();
  res.json({ success: true, data: quotes });
});

const getQuote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quote = await getQuoteById(id);
  res.json({ success: true, data: quote });
});

const createQuoteHandler = asyncHandler(async (req, res) => {
  const { cliente_id, fecha_vencimiento, items, notas } = req.body;
  const userId = req.user.id;

  const quote = await createQuote({ cliente_id, fecha_vencimiento, items, notas }, userId);
  res.status(201).json({ success: true, data: quote });
});

const updateQuote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const quote = await updateQuoteStatus(id, estado);
  res.json({ success: true, data: quote });
});

const deleteQuoteHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await deleteQuote(id);
  res.json({ success: true, message: "Cotización eliminada exitosamente" });
});

module.exports = { getQuotes, getQuote, createQuoteHandler, updateQuote, deleteQuoteHandler };