import mongoose from 'mongoose';

const { Schema } = mongoose;

// Base schema for all resources with location
const baseResourceSchema = {
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  priceInfo: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  hours: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
};

// Consulate Schema
const consulateSchema = new Schema({
  ...baseResourceSchema,
  country: {
    type: String,
    required: true
  },
  consulateType: {
    type: String,
    enum: ['Embassy', 'Consulate General', 'Consulate', 'Honorary Consulate'],
    default: 'Consulate'
  },
  services: [String] // e.g., ['Passport', 'Visa', 'Notary', 'Citizenship']
});

consulateSchema.index({ location: '2dsphere' });

// Immigration Lawyer Schema
const lawyerSchema = new Schema({
  ...baseResourceSchema,
  firmName: String,
  specializations: [String], // e.g., ['Family Immigration', 'Employment Visas', 'Asylum', 'Deportation Defense']
  languages: [String],
  isProBono: {
    type: Boolean,
    default: false
  },
  consultationFee: String,
  yearsExperience: Number
});

lawyerSchema.index({ location: '2dsphere' });

// Civil Surgeon Schema
const surgeonSchema = new Schema({
  ...baseResourceSchema,
  isUSCISApproved: {
    type: Boolean,
    default: true
  },
  examTypes: [String], // e.g., ['I-693', 'Vaccinations', 'TB Test']
  acceptsInsurance: {
    type: Boolean,
    default: false
  },
  insuranceAccepted: [String],
  examFee: String,
  sameDayResults: {
    type: Boolean,
    default: false
  }
});

surgeonSchema.index({ location: '2dsphere' });

// Shelter Schema
const shelterSchema = new Schema({
  ...baseResourceSchema,
  shelterType: {
    type: String,
    enum: ['Emergency', 'Transitional', 'Family', 'Youth', 'Women', 'Veterans', 'Refugee', 'General'],
    default: 'General'
  },
  capacity: Number,
  is24Hour: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: true
  },
  services: [String], // e.g., ['Meals', 'Showers', 'Laundry', 'Counseling', 'Case Management']
  eligibility: String,
  isPetFriendly: {
    type: Boolean,
    default: false
  }
});

shelterSchema.index({ location: '2dsphere' });

// ICE Resource Schema
const iceResourceSchema = new Schema({
  ...baseResourceSchema,
  resourceType: {
    type: String,
    enum: ['Detention Center', 'Check-in Location', 'Legal Resource', 'Hotline', 'Online Service'],
    required: true
  },
  is24Hour: {
    type: Boolean,
    default: false
  },
  services: [String],
  isAnonymous: {
    type: Boolean,
    default: false
  }
});

iceResourceSchema.index({ location: '2dsphere' });

// Create models
export const Consulate = mongoose.model('Consulate', consulateSchema);
export const Lawyer = mongoose.model('Lawyer', lawyerSchema);
export const CivilSurgeon = mongoose.model('CivilSurgeon', surgeonSchema);
export const Shelter = mongoose.model('Shelter', shelterSchema);
export const ICEResource = mongoose.model('ICEResource', iceResourceSchema);

// Helper function to calculate distance between two points
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};
