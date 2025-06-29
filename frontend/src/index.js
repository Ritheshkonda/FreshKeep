// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // You can keep default index.css or remove it if you like
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);