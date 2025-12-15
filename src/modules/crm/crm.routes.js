const express = require("express");
const router = express.Router();

const leadsRoutes = require("./leads.routes");
const activitiesRoutes = require("./activities.routes");

router.use("/leads", leadsRoutes);
router.use("/", activitiesRoutes);

module.exports = router;