const app = require('./app');
require('./cron');

// Load environment variables
const port = process.env.PORT || 3000;

// Start server

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});