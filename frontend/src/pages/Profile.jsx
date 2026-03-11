import { useState } from 'react';
import axios from 'axios';
import '../App.css';

function Profile() {
  const [mobile, setMobile] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setMessage('❌ Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      // 1. Login (This creates an account in the DB if they don't have one)
      await axios.post('http://localhost:5000/api/users/login', { mobileNumber: mobile });
      
      // 2. Fetch their actual profile and order history
      const response = await axios.get(`http://localhost:5000/api/users/${mobile}`);
      setUserData(response.data.user);
      setHistory(response.data.history);
      
      setIsLoggedIn(true);
      setMessage('');
    } catch (error) {
      setMessage('❌ Failed to load profile. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setMobile('');
    setUserData(null);
    setHistory([]);
  };

  const isErrorMsg = message.includes('❌');

  // --- LOGIN SCREEN ---
  if (!isLoggedIn) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>👤 My Account</h1>
        {message && <div className={isErrorMsg ? "message-error" : "message-success"}>{message}</div>}
        
        <div className="card" style={{ marginTop: '30px' }}>
          <h2>Login / Sign Up</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>Enter your mobile number to view your rewards and past orders.</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="tel" 
              className="input-field" 
              placeholder="📱 Mobile Number" 
              value={mobile} 
              onChange={(e) => setMobile(e.target.value)}
              maxLength="10"
              style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '2px' }}
            />
            <button type="submit" className="btn btn-primary">Get OTP / Login</button>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD SCREEN ---
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>👤 Welcome back!</h1>
        <button onClick={handleLogout} style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ef4444', backgroundColor: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
      <p style={{ color: '#6b7280', marginTop: '-10px', marginBottom: '20px' }}>+91 {userData.mobileNumber}</p>

      {/* Rewards Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', color: 'white', textAlign: 'center', border: 'none' }}>
        <h2 style={{ color: 'white', margin: '0 0 10px 0' }}>SuperMarket Rewards</h2>
        <div style={{ fontSize: '48px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
          🪙 {userData.coins}
        </div>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', opacity: '0.9' }}>You earn 1 coin for every ₹10 spent!</p>
      </div>

      {/* Order History */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Past Orders ({history.length})</h2>
        {history.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center' }}>You haven't bought anything yet!</p>
        ) : (
          <ul className="cart-list" style={{ marginTop: '15px' }}>
            {history.map((order) => (
              <li key={order._id} className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 'bold', color: '#374151' }}>Order #{order._id.substring(order._id.length - 6)}</span>
                  <span style={{ fontWeight: 'bold', color: '#10b981' }}>₹{order.totalAmount}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {order.totalItems} items purchased
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Profile;