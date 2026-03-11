const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Models
const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User'); // NEW: Loyalty System

const app = express();

// 1. MIDDLEWARE (Must be first)
app.use(cors()); 
app.use(express.json()); 

// 2. DATABASE CONNECTION
// We added a small timeout setting here to help connection stability
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ==========================================
// 3. PRODUCT ROUTES (Inventory & Scanning)
// ==========================================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Fetch Product by Barcode
app.get('/api/products/:barcode', async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new product 
app.post('/api/products', async (req, res) => {
  try {
    const { barcode, name, price, stock } = req.body;
    const newProduct = new Product({ barcode, name, price, stock: stock || 10 });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product' });
  }
});

// Update existing product (Restocking)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { stock } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true } 
    );
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update stock' });
  }
});

// Delete a product 
app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// ==========================================
// 4. USER & LOYALTY ROUTES
// ==========================================

// Login or Signup 
app.post('/api/users/login', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    let user = await User.findOne({ mobileNumber });
    
    // If user doesn't exist, create an account for them
    if (!user) {
      user = new User({ mobileNumber, coins: 0 });
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get User Profile & Order History
app.get('/api/users/:mobile', async (req, res) => {
  try {
    const user = await User.findOne({ mobileNumber: req.params.mobile });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const history = await Order.find({ mobileNumber: req.params.mobile }).sort({ createdAt: -1 });
    res.json({ user, history });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// ==========================================
// 5. ORDER ROUTES (Checkout & Guard)
// ==========================================

// Save Order, Deduct Stock & AWARD COINS
app.post('/api/orders', async (req, res) => {
  try {
    const { mobileNumber, totalItems, totalAmount, items } = req.body;
    
    // 1. Deduct Stock
    for (let item of items) {
      await Product.findOneAndUpdate(
        { barcode: item.barcode },
        { $inc: { stock: -item.quantity } } 
      );
    }

    // 2. Award Coins (1 coin per ₹10 spent)
    const earnedCoins = Math.floor(totalAmount / 10);
    await User.findOneAndUpdate(
      { mobileNumber },
      { $inc: { coins: earnedCoins } },
      { upsert: true } // Creates user if they don't exist
    );

    // 3. Save Order
    const newOrder = new Order({ mobileNumber, totalItems, totalAmount, items });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ message: 'Failed to save order' });
  }
});

// Verify an Order by ID 
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found or invalid.' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Invalid Order ID format.' });
  }
});

// ==========================================
// 6. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
});