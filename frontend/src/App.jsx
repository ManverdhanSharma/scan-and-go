import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Customer from './pages/Customer';
import Guard from './pages/Guard';
import Admin from './pages/Admin';
import Profile from './pages/Profile'; // <-- NEW IMPORT
import './App.css';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (pin === '1234') {
      setIsAuthenticated(true);
    } else {
      setError('❌ Incorrect PIN');
      setPin('');
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div className="card" style={{ textAlign: 'center', marginTop: '40px' }}>
        <h2>🔒 Staff Access Only</h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Please enter your 4-digit PIN.</p>
        
        <input 
          type="password" 
          className="input-field" 
          placeholder="Enter PIN" 
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          maxLength="4"
          style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '10px' }}
        />
        
        {error && <p style={{ color: '#ef4444', fontWeight: 'bold' }}>{error}</p>}
        
        <button className="btn btn-primary" onClick={handleLogin} style={{ marginTop: '20px' }}>
          Unlock Dashboard
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        
        <nav className="navbar">
          <Link to="/" className="nav-link">🛒 Shop</Link>
          <Link to="/profile" className="nav-link">👤 Profile</Link> {/* <-- NEW LINK */}
          <Link to="/guard" className="nav-link">🛡️ Guard</Link>
          <Link to="/admin" className="nav-link">🛠️ Admin</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Customer />} />
          <Route path="/profile" element={<Profile />} /> {/* <-- NEW ROUTE */}
          
          <Route path="/guard" element={
            <ProtectedRoute>
              <Guard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
        </Routes>
        
      </div>
    </BrowserRouter>
  );
}

export default App;