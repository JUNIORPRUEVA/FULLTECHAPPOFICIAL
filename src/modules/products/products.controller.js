const service = require("./products.service");

async function getAll(req, res, next) {
  try {
    const products = await service.getAllProducts();
    res.json({ ok: true, products });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const product = await service.getProductById(req.params.id);
    res.json({ ok: true, product });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const product = await service.createProduct(req.body);
    res.status(201).json({ ok: true, product });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const product = await service.updateProduct(req.params.id, req.body);
    res.json({ ok: true, product });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await service.deleteProduct(req.params.id);
    res.json({ ok: true, message: "Producto eliminado" });
  } catch (e) {
    next(e);
  }
}

module.exports = { getAll, getById, create, update, remove };