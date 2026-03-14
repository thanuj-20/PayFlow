require('dotenv').config();
const { MongoClient } = require('mongodb');
const { readJSON } = require('./utils/fileHelper');

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    const db = client.db('payflow');

    const collections = ['users', 'employees', 'attendance', 'payroll', 'payslips', 'leaves'];

    for (const name of collections) {
      await db.collection(name).deleteMany({});
      try {
        const data = readJSON(name);
        if (data.length > 0) {
          await db.collection(name).insertMany(data);
          console.log(`${name} seeded (${data.length} records)`);
        } else {
          console.log(`${name} skipped (empty)`);
        }
      } catch {
        console.log(`${name} skipped (no file)`);
      }
    }

    console.log('\nDatabase seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  } finally {
    await client.close();
  }
}

seedDatabase();
