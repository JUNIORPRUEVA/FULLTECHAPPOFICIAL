const service = require("./activities.service");

async function getForLead(req, res, next) {
  try {
    const activities = await service.getActivitiesForLead(req.params.leadId, req.user.ownerId);
    res.json({ ok: true, activities });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const activity = await service.createActivity(req.params.leadId, req.body, req.user.userId, req.user.ownerId);
    res.status(201).json({ ok: true, activity });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await service.deleteActivity(req.params.id, req.user.ownerId);
    res.json({ ok: true, message: "Actividad eliminada" });
  } catch (e) {
    next(e);
  }
}

module.exports = { getForLead, create, remove };