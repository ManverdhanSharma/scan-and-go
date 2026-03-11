import { useState } from 'react';
import axios from 'axios';
import BarcodeScanner from '../components/BarcodeScanner';
import { QRCodeCanvas } from 'qrcode.react';
import '../App.css';

function Customer() {
  const [cart, setCart] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [manualBarcode, setManualBarcode] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [mobile, setMobile] = useState('');

  const handleScan = async (barcode) => {
    if (!barcode) return;
    setIsScanning(false);
    setMessage(`Fetching product...`);

    try {
      const response = await axios.get(`http://localhost:5000/api/products/${barcode}`);
      const product = response.data;

      // CHECK 1: Is it completely out of stock?
      if (product.stock <= 0) {
        setMessage(`❌ Sorry, ${product.name} is currently out of stock!`);
        setManualBarcode('');
        return;
      }

      // NEW CHECK: Prevent bulk ordering! (Limit to 15 items total)
      const currentTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      if (currentTotalItems >= 15) {
        setMessage('❌ Express Checkout Limit Reached (15 items max). Please proceed to pay.');
        setManualBarcode('');
        return;
      }

      let stockError = false;

      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.barcode === product.barcode);
        
        if (existingItem) {
          // CHECK 3: Are they trying to buy more than we have?
          if (existingItem.quantity >= product.stock) {
            stockError = true;
            return prevCart; 
          }
          return prevCart.map(item => 
            item.barcode === product.barcode ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevCart, { ...product, quantity: 1, priceAtCheckout: product.price }];
      });
      
      if (stockError) {
        setMessage(`❌ Cannot add more! Only ${product.stock} ${product.name}(s) left in store.`);
      } else {
        setMessage(`✅ Added ${product.name}!`);
      }
      setManualBarcode(''); 
    } catch (error) {
      console.error(error);
      setMessage('❌ Product not found.');
    }
  };

  const handleCheckout = async () => {
    if (!mobile || mobile.length < 10) {
      setMessage('❌ Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const response = await axios.post('http://localhost:5000/api/orders', {
        mobileNumber: mobile, 
        totalItems, 
        totalAmount, 
        items: cart
      });

      setReceipt(response.data);
      setCart([]); 
      setMobile(''); 
      setMessage('');
    } catch (error) {
      console.error(error);
      setMessage('❌ Checkout failed.');
    }
  };

  if (receipt) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1 style={{ color: '#10b981' }}>✅ Payment Successful!</h1>
        <div className="qr-container">
          <QRCodeCanvas value={receipt._id} size={200} />
        </div>
        <h2>Show this to the exit guard.</h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Order ID: {receipt._id}</p>
        <h2 style={{ fontSize: '22px', margin: '20px 0' }}>Total Paid: ₹{receipt.totalAmount}</h2>
        <button className="btn btn-primary" onClick={() => setReceipt(null)}>
          Start New Shop
        </button>
      </div>
    );
  }

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const isErrorMsg = message.includes('❌');

  return (
    <div>
      <h1>🛒 Scan & Go</h1>
      
      <div className="card" style={{ textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={() => setIsScanning(!isScanning)} style={{ marginBottom: '15px' }}>
          {isScanning ? 'Close Camera' : '📷 Tap to Scan Item'}
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            className="input-field"
            placeholder="Enter Barcode" 
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
          />
          <button className="btn btn-success" style={{ width: 'auto', padding: '14px 25px' }} onClick={() => handleScan(manualBarcode)}>
            Add
          </button>
        </div>
      </div>

      {message && <div className={isErrorMsg ? "message-error" : "message-success"}>{message}</div>}

      {isScanning && (
        <div className="card">
          <BarcodeScanner onScan={handleScan} />
        </div>
      )}

      <div className="card">
        <h2>Your Cart</h2>
        {cart.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center' }}>Your cart is empty.</p>
        ) : (
          <>
            <ul className="cart-list">
              {cart.map((item, index) => (
                <li key={index} className="cart-item">
                  <span className="cart-item-name">{item.name} <span style={{ color: '#6b7280', fontSize: '14px' }}>(x{item.quantity})</span></span>
                  <span className="cart-item-price">₹{item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0', borderTop: '2px dashed #e5e7eb', paddingTop: '15px' }}>
              <h2 style={{ margin: 0 }}>Total:</h2>
              <h2 style={{ margin: 0, color: '#10b981' }}>₹{cartTotal}</h2>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <input 
                type="tel" 
                className="input-field"
                placeholder="📱 Enter Mobile No. (For Rewards)" 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength="10"
              />
            </div>

            <button className="btn btn-checkout" onClick={handleCheckout}>
              Pay ₹{cartTotal} & Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Customer;