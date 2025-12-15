const service = require("./auth.service");

async function register(req, res, next) {
  try {
    const result = await service.register(req.body);
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}

async function login(req, res, next) {
  try {
    const result = await service.login(req.body);
    res.json({ ok: true, ...result });
  } catch (e) {
    next(e);
  }
}

async function profile(req, res, next) {
  try {
    const user = await service.getProfile(req.user.userId);
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login, profile };
