require('dotenv').config();
const connectDB = require('./config/db');
const VisaCategory = require('./models/VisaCategory');

const sampleCategories = [
  {
    visaCode: 'UAE-DRV-01',
    visaCategoryName: 'Light Motor Vehicle Driver',
    country: 'UAE',
    allowedJobRoles: ['Taxi Driver', 'Delivery Driver', 'LMV Driver', 'Private Chauffeur'],
    disallowedJobRoles: ['Heavy Truck Operator', 'Auto Mechanic', 'Fleet Supervisor'],
    riskWeight: 5
  },
  {
    visaCode: 'UAE-MECH-02',
    visaCategoryName: 'Automobile Mechanic / Technician',
    country: 'UAE',
    allowedJobRoles: ['Auto Mechanic', 'Vehicle Technician', 'Workshop Technician', 'Engine Repair Specialist'],
    disallowedJobRoles: ['Heavy Truck Driver', 'Taxi Driver'],
    riskWeight: 4
  },
  {
    visaCode: 'SAU-HDT-03',
    visaCategoryName: 'Heavy Duty Truck Operator',
    country: 'Saudi Arabia',
    allowedJobRoles: ['Heavy Truck Operator', 'Heavy Vehicle Driver', 'Trailer Driver'],
    disallowedJobRoles: ['Taxi Driver', 'Auto Mechanic'],
    riskWeight: 6
  },
  {
    visaCode: 'QAT-FLT-04',
    visaCategoryName: 'Fleet Supervisor',
    country: 'Qatar',
    allowedJobRoles: ['Fleet Supervisor', 'Fleet Manager', 'Logistics Coordinator'],
    disallowedJobRoles: ['Taxi Driver', 'Auto Mechanic', 'General Labourer'],
    riskWeight: 3
  },
  {
    visaCode: 'UAE-GEN-05',
    visaCategoryName: 'General Labourer',
    country: 'UAE',
    allowedJobRoles: ['General Labourer', 'Cleaner', 'Helper'],
    disallowedJobRoles: ['Heavy Truck Operator', 'Auto Mechanic', 'Fleet Supervisor', 'Taxi Driver'],
    riskWeight: 8 // common mismatch source in real cases — high weight
  }
];

async function seed() {
  await connectDB();
  await VisaCategory.deleteMany({});
  await VisaCategory.insertMany(sampleCategories);
  console.log(`Seeded ${sampleCategories.length} visa categories.`);
  process.exit(0);
}

seed();
