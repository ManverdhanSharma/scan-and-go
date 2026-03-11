const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true }, // <-- NEW: Mandatory for loyalty!
  totalItems: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'paid' },
  items: [{
    barcode: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    priceAtCheckout: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);