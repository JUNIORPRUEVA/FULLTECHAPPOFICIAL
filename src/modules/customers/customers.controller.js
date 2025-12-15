const service = require("./customers.service");

async function getAll(req, res, next) {
  try {
    const customers = await service.getAllCustomers();
    res.json({ ok: true, customers });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const customer = await service.getCustomerById(req.params.id);
    res.json({ ok: true, customer });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const customer = await service.createCustomer(req.body);
    res.status(201).json({ ok: true, customer });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const customer = await service.updateCustomer(req.params.id, req.body);
    res.json({ ok: true, customer });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await service.deleteCustomer(req.params.id);
    res.json({ ok: true, message: "Cliente eliminado" });
  } catch (e) {
    next(e);
  }
}

module.exports = { getAll, getById, create, update, remove };