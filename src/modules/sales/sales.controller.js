const service = require("./sales.service");

async function getAll(req, res, next) {
  try {
    const sales = await service.getAllSales();
    res.json({ ok: true, sales });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const sale = await service.getSaleById(req.params.id);
    res.json({ ok: true, sale });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const sale = await service.createSale(req.body, req.user.userId);
    res.status(201).json({ ok: true, sale });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await service.deleteSale(req.params.id);
    res.json({ ok: true, message: "Venta eliminada" });
  } catch (e) {
    next(e);
  }
}

module.exports = { getAll, getById, create, remove };