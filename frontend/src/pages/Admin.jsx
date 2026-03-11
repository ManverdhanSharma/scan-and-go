import { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function Admin() {
  const [products, setProducts] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState(''); 
  const [message, setMessage] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://scan-and-go-backend-kiu3.onrender.com/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!barcode || !name || !price || !stock) {
      setMessage('❌ Please fill in all fields including stock.');
      return;
    }

    try {
      await axios.post('https://scan-and-go-backend-kiu3.onrender.com/api/products', {
        barcode,
        name,
        price: Number(price),
        stock: Number(stock)
      });
      setMessage(`✅ Added ${name} with ${stock} in stock!`);
      setBarcode('');
      setName('');
      setPrice('');
      setStock('');
      fetchProducts(); 
    } catch (error) {
      setMessage('❌ Failed to add product.');
    }
  };

  // NEW: Handle restocking existing items
  const handleUpdateStock = async (id, currentStock, productName) => {
    const addedStock = window.prompt(`How many NEW units of ${productName} arrived?`);
    
    if (addedStock && !isNaN(addedStock) && Number(addedStock) > 0) {
      const newTotal = currentStock + Number(addedStock);
      try {
        await axios.put(`https://scan-and-go-backend-kiu3.onrender.com/api/products/${id}`, { stock: newTotal });
        setMessage(`✅ Restocked! ${productName} now has ${newTotal} in stock.`);
        fetchProducts(); 
      } catch (error) {
        setMessage('❌ Failed to update stock.');
      }
    }
  };

  const handleDeleteProduct = async (id, productName) => {
    if (window.confirm(`Delete ${productName}?`)) {
      try {
        await axios.delete(`https://scan-and-go-backend-kiu3.onrender.com/api/products/${id}`);
        setMessage(`✅ Deleted ${productName}`);
        fetchProducts();
      } catch (error) {
        setMessage('❌ Failed to delete product.');
      }
    }
  };

  const isErrorMsg = message.includes('❌');

  return (
    <div style={{ padding: '20px' }}>
      <h1>🛠️ Inventory Manager</h1>

      {message && <div className={isErrorMsg ? "message-error" : "message-success"}>{message}</div>}

      <div className="card">
        <h2>Add New Product</h2>
        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" className="input-field" placeholder="Barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
          <input type="text" className="input-field" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" className="input-field" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} />
            <input type="number" className="input-field" placeholder="Qty in Stock" value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
          
          <button type="submit" className="btn btn-primary">➕ Save to Database</button>
        </form>
      </div>

      <div className="card">
        <h2>Current Stock ({products.length} items)</h2>
        <ul className="cart-list">
          {products.map((product) => (
            <li key={product._id} className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span className="cart-item-name">{product.name}</span>
                <span className="cart-item-price">₹{product.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: '5px' }}>
                <span style={{ fontSize: '14px', color: product.stock <= 2 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>
                  Stock: {product.stock} left
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* NEW: Restock Button */}
                  <button 
                    onClick={() => handleUpdateStock(product._id, product.stock, product.name)}
                    style={{ backgroundColor: '#dbeafe', color: '#3b82f6', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    + Restock
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product._id, product.name)}
                    style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Admin;