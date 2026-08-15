const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  id: String,
  userId: {
    type: String,
    required: true
  },
  hotelId: {
    type: String,
    required: true
  },
  hotelName: String,
  location: String,
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  nights: Number,
  price: Number,
  originalPrice: Number,
  status: {
    type: String,
    enum: ['Upcoming', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  reviewed: {
    type: Boolean,
    default: false
  },
  reviewText: String,
  reviewComment: String,
  reviewDate: Date,
  image: String,
  guestName: String,
  guestEmail: String,
  phone: String,
  specialRequests: String,
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);

