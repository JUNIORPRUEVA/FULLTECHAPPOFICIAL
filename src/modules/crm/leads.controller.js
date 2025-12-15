const service = require("./leads.service");

async function getAll(req, res, next) {
  try {
    const leads = await service.getAllLeads(req.user.ownerId);
    res.json({ ok: true, leads });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const lead = await service.getLeadById(req.params.id, req.user.ownerId);
    res.json({ ok: true, lead });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const lead = await service.createLead(req.body, req.user.ownerId);
    res.status(201).json({ ok: true, lead });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const lead = await service.updateLead(req.params.id, req.body, req.user.ownerId);
    res.json({ ok: true, lead });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await service.deleteLead(req.params.id, req.user.ownerId);
    res.json({ ok: true, message: "Lead eliminado" });
  } catch (e) {
    next(e);
  }
}

async function convertToCustomer(req, res, next) {
  try {
    const customer = await service.convertToCustomer(req.params.id, req.user.ownerId);
    res.json({ ok: true, customer, message: "Lead convertido a cliente" });
  } catch (e) {
    next(e);
  }
}

module.exports = { getAll, getById, create, update, remove, convertToCustomer };