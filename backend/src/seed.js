// Seeds the database with the same demo cases the frontend ships with,
// plus a demo user you can log in with. Run: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Case = require('./models/Case');
const Draft = require('./models/Draft');

// Mirrors the defaultCases in the frontend's src/lib/data.ts
const demoCases = [
  { caseId: 'FIR-2023-089', title: 'Property Dispute - Sector 4', date: 'Oct 12, 2023', status: 'Active', category: 'Property Dispute' },
  { caseId: 'CMP-2023-112', title: 'Noise Complaint - Nighttime', date: 'Oct 28, 2023', status: 'Active', category: 'Other' },
  { caseId: 'CMP-2023-113', title: 'Noise Complaint - Nighttime', date: 'Oct 28, 2023', status: 'Pending', category: 'Other' },
  { caseId: 'CMP-2023-114', title: 'Vehicle Theft - Sector 1', date: 'Oct 29, 2023', status: 'Active', category: 'Theft' },
  { caseId: 'CMP-2023-115', title: 'Fraud - Online Transaction', date: 'Nov 01, 2023', status: 'Pending', category: 'Fraud' },
  { caseId: 'CMP-2023-088', title: 'Property Dispute - Sector 14', date: 'Nov 12, 2023', status: 'Pending', category: 'Property Dispute' },
  { caseId: 'FIR-2023-090', title: 'Assault - Downtown', date: 'Nov 15, 2023', status: 'Closed', category: 'Assault' },
];

const DEMO_USER = {
  fullName: 'Arsh Pratap Singh',
  email: 'officer@janmitra.gov',
  password: 'password123',
};

async function seed() {
  try {
    await connectDB();
    console.log('🌱 Seeding database ...');

    await Case.deleteMany({});
    await Case.insertMany(demoCases);
    console.log(`   Inserted ${demoCases.length} demo cases`);

    await Draft.deleteMany({});
    await User.deleteOne({ email: DEMO_USER.email });
    await User.create(DEMO_USER); // password hashed by the pre-save hook
    console.log(`   Created demo user -> ${DEMO_USER.email} / ${DEMO_USER.password}`);

    console.log('✅ Seed complete');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
