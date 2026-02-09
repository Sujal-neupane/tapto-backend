// Script to seed delivery drivers with Indian and Nepali names (TypeScript)
import mongoose from 'mongoose';
import DeliveryDriver from '../src/models/delivery_driver.model';

const drivers = [
  { name: 'Amit Sharma', phone: '+91 9876543210', email: 'amit.sharma@example.com', vehicleNumber: 'DL 5S 1234', avatarUrl: '', isActive: true },
  { name: 'Sita Gurung', phone: '+977 9812345678', email: 'sita.gurung@example.com', vehicleNumber: 'BA 2 PA 4321', avatarUrl: '', isActive: true },
  { name: 'Ramesh Thapa', phone: '+977 9801122334', email: 'ramesh.thapa@example.com', vehicleNumber: 'GA 1 KHA 5678', avatarUrl: '', isActive: true },
  { name: 'Priya Singh', phone: '+91 9123456789', email: 'priya.singh@example.com', vehicleNumber: 'MH 12 AB 9876', avatarUrl: '', isActive: true },
  { name: 'Manoj Yadav', phone: '+91 9988776655', email: 'manoj.yadav@example.com', vehicleNumber: 'UP 32 CD 2468', avatarUrl: '', isActive: true },
  { name: 'Bikash Shrestha', phone: '+977 9841234567', email: 'bikash.shrestha@example.com', vehicleNumber: 'LU 3 PA 1357', avatarUrl: '', isActive: true },
];

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/tapto_db');
  await DeliveryDriver.deleteMany({});
  await DeliveryDriver.insertMany(drivers);
  console.log('Seeded delivery drivers!');
  await mongoose.disconnect();
}

seed();
