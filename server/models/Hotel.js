const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  price: { type: Number, default: 0 },
  images: { type: [String], default: [] },
  type: { type: String },
  guests: { type: Number, default: 1 },
  categories: { type: [String], default: [] },
  hostEmail: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hotel', HotelSchema);
