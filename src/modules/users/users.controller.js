const service = require("./users.service");

async function getAll(req, res, next) {
  try {
    const users = await service.getAllUsers();
    res.json({ ok: true, users });
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const user = await service.getUserById(req.params.id);
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const user = await service.createUser(req.body);
    res.status(201).json({ ok: true, user });
  } catch (e) {
    next(e);
  }
}

async function update(req, res, next) {
  try {
    const user = await service.updateUser(req.params.id, req.body);
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await service.deleteUser(req.params.id);
    res.json({ ok: true, message: "Usuario eliminado" });
  } catch (e) {
    next(e);
  }
}

async function changePassword(req, res, next) {
  try {
    await service.changePassword(req.user.userId, req.body);
    res.json({ ok: true, message: "Contraseña cambiada" });
  } catch (e) {
    next(e);
  }
}

module.exports = { getAll, getById, create, update, remove, changePassword };