import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import CartDrawer from './components/Cart/CartDrawer';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <CartDrawer />
  </React.StrictMode>
);
