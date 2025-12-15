const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testAPIs() {
  console.log("🧪 Probando APIs...\n");

  // Test 1: Health check
  try {
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5004,
      path: '/',
      method: 'GET'
    });
    console.log(`✅ Health check: ${health.status} - ${JSON.stringify(health.data)}`);
  } catch (err) {
    console.log(`❌ Health check falló: ${err.message}`);
  }

  // Test 2: Register user
  try {
    const register = await makeRequest({
      hostname: 'localhost',
      port: 5004,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      nombre: "Test User API",
      usuario: "testapi",
      email: "testapi@example.com",
      password: "123456"
    });
    console.log(`✅ Register: ${register.status} - ${register.data.ok ? 'Usuario creado' : register.data.message}`);
  } catch (err) {
    console.log(`❌ Register falló: ${err.message}`);
  }

  // Test 3: Login
  try {
    const login = await makeRequest({
      hostname: 'localhost',
      port: 5004,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      usuario: "testapi",
      password: "123456"
    });

    if (login.status === 200 && login.data.ok) {
      console.log(`✅ Login: ${login.status} - Token obtenido`);
      const token = login.data.token;

      // Test 4: Get profile with token
      try {
        const profile = await makeRequest({
          hostname: 'localhost',
          port: 5004,
          path: '/api/auth/profile',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ Profile: ${profile.status} - ${profile.data.ok ? 'Perfil obtenido' : profile.data.message}`);
      } catch (err) {
        console.log(`❌ Profile falló: ${err.message}`);
      }

      // Test 5: Get users
      try {
        const users = await makeRequest({
          hostname: 'localhost',
          port: 5004,
          path: '/api/users',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ Users: ${users.status} - ${users.data.ok ? `${users.data.users.length} usuarios` : users.data.message}`);
      } catch (err) {
        console.log(`❌ Users falló: ${err.message}`);
      }

      // Test 6: Get products
      try {
        const products = await makeRequest({
          hostname: 'localhost',
          port: 5004,
          path: '/api/products',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ Products: ${products.status} - ${products.data.ok ? `${products.data.products.length} productos` : 'Error: ' + products.data.message}`);
      } catch (err) {
        console.log(`❌ Products falló: ${err.message}`);
      }

      // Test 7: Get customers
      try {
        const customers = await makeRequest({
          hostname: 'localhost',
          port: 5004,
          path: '/api/customers',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ Customers: ${customers.status} - ${customers.data.ok ? `${customers.data.customers.length} clientes` : 'Error: ' + customers.data.message}`);
      } catch (err) {
        console.log(`❌ Customers falló: ${err.message}`);
      }

      // Test 8: Get sales
      try {
        const sales = await makeRequest({
          hostname: 'localhost',
          port: 5004,
          path: '/api/sales',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`✅ Sales: ${sales.status} - ${sales.data.ok ? `${sales.data.sales.length} ventas` : 'Error: ' + sales.data.message}`);
      } catch (err) {
        console.log(`❌ Sales falló: ${err.message}`);
      }

    } else {
      console.log(`❌ Login falló: ${login.status} - ${login.data.message}`);
    }
  } catch (err) {
    console.log(`❌ Login falló: ${err.message}`);
  }

  // Test APIs that need missing tables
  console.log("\n📋 APIs que necesitan tablas faltantes:");
  console.log("❌ Categories - Falta tabla 'categorias'");
  console.log("❌ Sales details - Falta tabla 'detalle_ventas'");
  console.log("❌ CRM Leads - Falta tabla 'leads'");
  console.log("❌ CRM Activities - Falta tabla 'actividades'");
}

testAPIs();