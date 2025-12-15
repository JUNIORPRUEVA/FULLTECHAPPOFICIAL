const { env } = require("./config/env");
const app = require("./app");
const backupScheduler = require("./services/backup.scheduler");

app.listen(env.PORT, () => {
  console.log(`✅ API corriendo en http://localhost:${env.PORT}`);

  // Iniciar sistema de backup automático
  backupScheduler.startAll();
});
