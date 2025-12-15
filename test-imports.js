console.log('Testing imports...');

try {
  console.log('1. Testing dotenv...');
  require('dotenv').config();
  console.log('✅ dotenv OK');

  console.log('2. Testing env config...');
  const { env } = require('./src/config/env');
  console.log('✅ env config OK, PORT:', env.PORT);

  console.log('3. Testing database config...');
  const { pool } = require('./src/config/db');
  console.log('✅ database config OK');

  console.log('4. Testing app...');
  const app = require('./src/app');
  console.log('✅ app OK');

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}