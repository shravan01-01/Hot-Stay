const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: String,
  username: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  bio: String,
  avatar: String,
  createdAt: Date,
  lastLogin: Date,
  verified: Boolean
});

module.exports = mongoose.model('User', UserSchema);
