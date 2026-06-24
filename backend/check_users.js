require('dotenv').config();
const { user, role } = require('./src/models');

async function check() {
  try {
    const users = await user.findAll({
      include: [{ model: role, as: 'role' }]
    });
    console.log('--- USERS IN DATABASE ---');
    users.forEach(u => {
      console.log(`ID: ${u.id}`);
      console.log(`Name: ${u.name}`);
      console.log(`Email: ${u.email}`);
      console.log(`Role: ${u.role ? u.role.nama_role : 'None'}`);
      console.log('-------------------------');
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

check();
