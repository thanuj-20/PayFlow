require('dotenv').config();
const { MongoClient } = require('mongodb');
const { readJSON } = require('./utils/fileHelper');

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    const db = client.db('payflow');

    // Seed users
    const users = readJSON('users');
    if (users.length > 0) {
      await db.collection('users').insertMany(users);
      console.log('Users seeded successfully');
    }

    // Seed employees
    const employees = readJSON('employees');
    if (employees.length > 0) {
      await db.collection('employees').insertMany(employees);
      console.log('Employees seeded successfully');
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();