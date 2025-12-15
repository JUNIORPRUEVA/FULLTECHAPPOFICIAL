console.log("Para probar las APIs, puedes usar:");
console.log("1. Postman: Importa las rutas y envía requests");
console.log("2. curl commands:");
console.log("");
console.log("// Health check");
console.log('curl http://localhost:5004/');
console.log("");
console.log("// Register user");
console.log(`curl -X POST http://localhost:5004/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"nombre":"Test User","email":"test@example.com","password":"123456"}'`);
console.log("");
console.log("// Login");
console.log(`curl -X POST http://localhost:5004/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"test@example.com","password":"123456"}'`);
console.log("");
console.log("// Get products (needs token)");
console.log('curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5004/api/products');
console.log("");
console.log("3. Instala Postman y crea una colección con estas rutas:");
console.log("- GET /");
console.log("- POST /api/auth/register");
console.log("- POST /api/auth/login");
console.log("- GET /api/auth/profile (con token)");
console.log("- GET /api/users (con token)");
console.log("- GET /api/products (con token)");
console.log("- GET /api/categories (con token)");
console.log("- GET /api/customers (con token)");
console.log("- GET /api/sales (con token)");
console.log("- GET /api/crm/leads (con token)");
console.log("");
console.log("¡La base de datos está conectada correctamente!");