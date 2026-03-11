const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 10 } // <-- NEW: Tracks inventory!
});

module.exports = mongoose.model('Product', productSchema);