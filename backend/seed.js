const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

// Here is your starting inventory. 
// (You can grab real items from your house and change these barcodes later!)
const dummyProducts = [
  { barcode: "123456789", name: "Parle-G Biscuits", price: 10, imageUrl: "https://via.placeholder.com/150" },
  { barcode: "987654321", name: "Head & Shoulders Shampoo", price: 150, imageUrl: "https://via.placeholder.com/150" },
  { barcode: "111222333", name: "Coca-Cola 500ml", price: 40, imageUrl: "https://via.placeholder.com/150" }
];

// Connect to database, insert products, and disconnect
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('⏳ Connected to Database. Injecting inventory...');
    
    // Clear out any old test data first
    await Product.deleteMany({}); 
    
    // Inject the new products
    await Product.insertMany(dummyProducts);
    
    console.log('✅ Success! Inventory injected.');
    process.exit();
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });