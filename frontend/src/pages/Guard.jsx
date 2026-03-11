import { useState } from 'react';
import axios from 'axios';
import BarcodeScanner from '../components/BarcodeScanner';
import '../App.css';

function Guard() {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [message, setMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const verifyOrder = async (idToVerify) => {
    if (!idToVerify) return;
    setMessage('Checking system...');
    setOrderData(null);
    setIsScanning(false);

    try {
      const response = await axios.get(`http://localhost:5000/api/orders/${idToVerify}`);
      setOrderData(response.data);
      setMessage('✅ Order Verified!');
      setOrderId(idToVerify); 
    } catch (error) {
      setMessage('❌ ALERT: Order not found or invalid!');
    }
  };

  const isErrorMsg = message.includes('❌');

  return (
    <div>
      <h1>🛡️ Guard Dashboard</h1>
      
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Verify Receipt</h2>
        
        <button className="btn btn-success" onClick={() => setIsScanning(!isScanning)} style={{ marginBottom: '20px' }}>
          {isScanning ? 'Close Camera' : '📷 Scan Customer QR Code'}
        </button>

        {isScanning && <BarcodeScanner onScan={verifyOrder} />}

        <div style={{ textAlign: 'center', margin: '15px 0', color: '#9ca3af', fontSize: '14px', fontWeight: 'bold' }}>— OR —</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            className="input-field"
            placeholder="Enter Order ID Manually" 
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => verifyOrder(orderId)}>Check Order</button>
        </div>

        {message && <div className={isErrorMsg ? "message-error" : "message-success"} style={{ marginTop: '20px' }}>{message}</div>}

        {orderData && (
          <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#374151' }}>Status:</h3>
              <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
                VERIFIED
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#6b7280' }}>Total Items:</span>
              <span style={{ fontWeight: 'bold' }}>{orderData.totalItems}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
              <span style={{ color: '#6b7280' }}>Amount Paid:</span>
              <span style={{ fontWeight: 'bold', color: '#10b981' }}>₹{orderData.totalAmount}</span>
            </div>

            <h4 style={{ margin: '0 0 10px 0', color: '#374151' }}>Purchased Items</h4>
            <ul className="cart-list" style={{ margin: 0 }}>
              {orderData.items.map((item, index) => (
                <li key={index} className="cart-item" style={{ padding: '8px 0', borderBottom: 'none' }}>
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-price" style={{ color: '#6b7280' }}>x{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Guard;