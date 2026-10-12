const { server } = require('./app');
const { sequelize } = require('./models');
require('./cron');

// Load environment variables
const port = process.env.PORT || 3000;

// Test database connection on startup
sequelize.authenticate()
  .then(() => {
    console.log(`[DATABASE] Successfully connected to: ${sequelize.config.database} on ${sequelize.config.host}:${sequelize.config.port}`);
  })
  .catch((err) => {
    console.error(`[DATABASE ERROR] Failed to connect:`, err.message);
  });

// Start server
server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});