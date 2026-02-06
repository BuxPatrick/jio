import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  Consulate,
  Lawyer,
  CivilSurgeon,
  Shelter,
  ICEResource
} from '../models/Resource.js';
import connectDB from '../config/database.js';

dotenv.config();

// Sample data for seeding
const consulatesData = [
  {
    name: 'San Francisco Consulate',
    description: 'Passport & Visa Services',
    details: 'Mon-Fri: 9AM-5PM',
    rating: 4.5,
    priceInfo: 'Appointment required',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    address: { city: 'San Francisco', state: 'CA', zipCode: '94102' },
    contact: { phone: '(415) 555-0100', email: 'sf@consulate.gov' },
    hours: 'Mon-Fri: 9AM-5PM',
    country: 'USA',
    consulateType: 'Consulate General',
    services: ['Passport', 'Visa', 'Notary', 'Citizenship']
  },
  {
    name: 'Los Angeles Consulate',
    description: 'Full Service Consulate',
    details: 'Mon-Fri: 8AM-4PM',
    rating: 4.2,
    priceInfo: 'Walk-in available',
    location: { type: 'Point', coordinates: [-118.2437, 34.0522] },
    address: { city: 'Los Angeles', state: 'CA', zipCode: '90012' },
    contact: { phone: '(213) 555-0200', email: 'la@consulate.gov' },
    hours: 'Mon-Fri: 8AM-4PM',
    country: 'USA',
    consulateType: 'Consulate General',
    services: ['Passport', 'Visa', 'Notary']
  },
  {
    name: 'New York Consulate',
    description: 'Emergency Services',
    details: '24/7 Hotline',
    rating: 4.7,
    priceInfo: 'Same-day processing',
    location: { type: 'Point', coordinates: [-74.0060, 40.7128] },
    address: { city: 'New York', state: 'NY', zipCode: '10001' },
    contact: { phone: '(212) 555-0300', email: 'nyc@consulate.gov' },
    hours: 'Mon-Fri: 9AM-6PM',
    country: 'USA',
    consulateType: 'Embassy',
    services: ['Passport', 'Visa', 'Emergency Services']
  }
];

const lawyersData = [
  {
    name: 'Immigration Law Group',
    firmName: 'ILG Associates',
    description: 'Family & Employment Visas',
    details: '25+ years experience',
    rating: 4.9,
    priceInfo: 'Consultation $200',
    location: { type: 'Point', coordinates: [-74.0060, 40.7128] },
    address: { city: 'New York', state: 'NY', zipCode: '10004' },
    contact: { phone: '(212) 555-1000', email: 'contact@ilg.com', website: 'www.ilg.com' },
    hours: 'Mon-Fri: 9AM-6PM',
    specializations: ['Family Immigration', 'Employment Visas', 'Green Cards'],
    languages: ['English', 'Spanish', 'Mandarin'],
    consultationFee: '$200',
    yearsExperience: 25
  },
  {
    name: 'Global Visa Attorneys',
    firmName: 'GVA LLP',
    description: 'Corporate Immigration',
    details: 'Fortune 500 clients',
    rating: 4.7,
    priceInfo: 'Hourly $350',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    address: { city: 'San Francisco', state: 'CA', zipCode: '94105' },
    contact: { phone: '(415) 555-2000', email: 'info@gva.com', website: 'www.gva.com' },
    hours: 'Mon-Fri: 8AM-7PM',
    specializations: ['H-1B Visas', 'L-1 Visas', 'EB-5 Investment'],
    languages: ['English', 'Hindi', 'Portuguese'],
    consultationFee: '$300',
    yearsExperience: 15
  }
];

const surgeonsData = [
  {
    name: 'Bay Area Medical Center',
    description: 'USCIS Approved Civil Surgeon',
    details: 'Vaccinations included',
    rating: 4.8,
    priceInfo: 'Exam $250',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
    address: { city: 'San Francisco', state: 'CA', zipCode: '94103' },
    contact: { phone: '(415) 555-3000', email: 'exams@baymed.com' },
    hours: 'Mon-Sat: 8AM-6PM',
    isUSCISApproved: true,
    examTypes: ['I-693', 'Vaccinations', 'TB Test'],
    acceptsInsurance: true,
    insuranceAccepted: ['Blue Cross', 'Aetna', 'Cigna'],
    examFee: '$250',
    sameDayResults: false
  },
  {
    name: 'New York Health Clinic',
    description: 'Immigration Physicals',
    details: 'Same-day results available',
    rating: 4.5,
    priceInfo: 'Complete $300',
    location: { type: 'Point', coordinates: [-74.0060, 40.7128] },
    address: { city: 'New York', state: 'NY', zipCode: '10016' },
    contact: { phone: '(212) 555-4000', email: 'physicals@nyhc.com' },
    hours: 'Mon-Fri: 7AM-7PM',
    isUSCISApproved: true,
    examTypes: ['I-693', 'Vaccinations'],
    acceptsInsurance: true,
    insuranceAccepted: ['UnitedHealthcare', 'EmblemHealth'],
    examFee: '$300',
    sameDayResults: true
  }
];

const sheltersData = [
  {
    name: 'Hope Emergency Shelter',
    description: '24/7 Emergency Housing',
    details: 'Hot meals provided',
    rating: 4.6,
    priceInfo: 'Free stay',
    location: { type: 'Point', coordinates: [-74.0060, 40.7128] },
    address: { city: 'New York', state: 'NY', zipCode: '10002' },
    contact: { phone: '(212) 555-5000', email: 'help@hopeshelter.org' },
    hours: '24/7',
    shelterType: 'Emergency',
    capacity: 120,
    is24Hour: true,
    isFree: true,
    services: ['Meals', 'Showers', 'Laundry', 'Case Management'],
    eligibility: 'Open to all in need'
  },
  {
    name: 'Safe Haven Center',
    description: 'Family Shelter',
    details: 'Children welcome',
    rating: 4.4,
    priceInfo: 'No cost accommodation',
    location: { type: 'Point', coordinates: [-118.2437, 34.0522] },
    address: { city: 'Los Angeles', state: 'CA', zipCode: '90013' },
    contact: { phone: '(213) 555-6000', email: 'info@safehaven.la' },
    hours: '24/7',
    shelterType: 'Family',
    capacity: 80,
    is24Hour: true,
    isFree: true,
    services: ['Meals', 'Childcare', 'Counseling', 'Job Training'],
    eligibility: 'Families with children'
  }
];

const iceResourcesData = [
  {
    name: 'ICE Case Status Online',
    description: 'Check Case Status',
    details: 'Real-time updates',
    rating: 4.5,
    priceInfo: 'Free service',
    location: { type: 'Point', coordinates: [-77.0369, 38.9072] },
    address: { city: 'Washington', state: 'DC', zipCode: '20001' },
    contact: { phone: '1-800-375-5283', website: 'www.uscis.gov' },
    hours: '24/7 Online',
    resourceType: 'Online Service',
    is24Hour: true,
    services: ['Case Status Check', 'Application Tracking'],
    isAnonymous: false
  },
  {
    name: 'Detention Locator',
    description: 'Find Detainees',
    details: 'Nationwide search',
    rating: 4.3,
    priceInfo: '24/7 hotline',
    location: { type: 'Point', coordinates: [-77.0369, 38.9072] },
    address: { city: 'Washington', state: 'DC', zipCode: '20001' },
    contact: { phone: '1-877-236-1260' },
    hours: '24/7',
    resourceType: 'Hotline',
    is24Hour: true,
    services: ['Detainee Location', 'Facility Information'],
    isAnonymous: true
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Starting database seeding...');

    // Clear existing data
    await Consulate.deleteMany({});
    await Lawyer.deleteMany({});
    await CivilSurgeon.deleteMany({});
    await Shelter.deleteMany({});
    await ICEResource.deleteMany({});

    console.log('Cleared existing data');

    // Insert new data
    await Consulate.insertMany(consulatesData);
    console.log(`✓ Seeded ${consulatesData.length} consulates`);

    await Lawyer.insertMany(lawyersData);
    console.log(`✓ Seeded ${lawyersData.length} lawyers`);

    await CivilSurgeon.insertMany(surgeonsData);
    console.log(`✓ Seeded ${surgeonsData.length} civil surgeons`);

    await Shelter.insertMany(sheltersData);
    console.log(`✓ Seeded ${sheltersData.length} shelters`);

    await ICEResource.insertMany(iceResourcesData);
    console.log(`✓ Seeded ${iceResourcesData.length} ICE resources`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nAPI Endpoints available:');
    console.log('  GET /api/resources/consulates');
    console.log('  GET /api/resources/lawyers');
    console.log('  GET /api/resources/surgeons');
    console.log('  GET /api/resources/shelters');
    console.log('  GET /api/resources/ice-resources');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
