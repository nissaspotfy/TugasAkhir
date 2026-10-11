const { server } = require('./app');
require('./cron');

// Load environment variables
const port = process.env.PORT || 3000;

// Start server

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});