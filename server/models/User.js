const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  dob: {
    type: String,
    default: ''
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  savedHotels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel'
  }],
  settings: {
    communication: {
      bookingUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      profileVisible: { type: Boolean, default: true },
      reviewsPublic: { type: Boolean, default: false }
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false }
    }
  },
  preferences: {
    roomType: { type: String, default: 'Any' },
    travelFrequency: { type: String, default: 'Occasionally' },
    priceRange: { type: String, default: 'Mid-Range' },
    locations: {
      beach: { type: Boolean, default: true },
      mountain: { type: Boolean, default: true },
      city: { type: Boolean, default: true },
      rural: { type: Boolean, default: false }
    },
    amenities: {
      pool: { type: Boolean, default: true },
      gym: { type: Boolean, default: true },
      restaurant: { type: Boolean, default: true },
      spa: { type: Boolean, default: false },
      wifi: { type: Boolean, default: true }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date,
  verified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

