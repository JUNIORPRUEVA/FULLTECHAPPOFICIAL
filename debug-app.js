try {
  const app = require('./src/app');
  console.log('✅ App loaded successfully');

  // Test database connection
  const { pool } = require('./src/config/db');
  console.log('✅ Database config loaded');

  // Get all routes
  console.log('\n📋 Available routes:');
  function printRoutes(stack, prefix = '') {
    stack.forEach(layer => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        console.log(`${methods} ${prefix}${layer.route.path}`);
      } else if (layer.name === 'router') {
        const newPrefix = prefix + (layer.regexp.source.replace('^\\/', '').replace('\\/?(?=\\/|$)', '') || '');
        printRoutes(layer.handle.stack, newPrefix);
      }
    });
  }

  printRoutes(app._router.stack);

} catch (error) {
  console.error('❌ Error loading app:', error.message);
  console.error(error.stack);
}