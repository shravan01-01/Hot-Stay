const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  price: { type: Number, default: 0 },
  originalPrice: { type: Number, default: 0 },
  images: { type: [String], default: [] },
  type: { type: String },
  guests: { type: Number, default: 1 },
  categories: { type: [String], default: [] },
  hostEmail: { type: String },
  host: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  bedrooms: { type: Number, default: 1 },
  beds: { type: Number, default: 1 },
  bathrooms: { type: Number, default: 1 },
  amenities: { type: [String], default: [] },
  reviews: {
    type: [{
      userName: String,
      avatar: String,
      date: String,
      comment: String,
      rating: Number
    }],
    default: []
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hotel', HotelSchema);
