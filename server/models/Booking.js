const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  id: String,
  userId: String,
  hotelId: String,
  hotelName: String,
  location: String,
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  nights: Number,
  price: Number,
  originalPrice: Number,
  status: String,
  rating: Number,
  reviewed: Boolean,
  reviewComment: String,
  image: String,
  bookingDate: Date
});

module.exports = mongoose.model('Booking', BookingSchema);
