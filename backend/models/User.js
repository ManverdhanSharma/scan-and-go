const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true, unique: true },
  coins: { type: Number, default: 0 }, 
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);