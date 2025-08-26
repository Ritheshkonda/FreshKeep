import React from 'react';

function FoodItemList({ items, onRemoveItem }) {
  const sortedItems = [...items].sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'expired';
    } else if (diffDays <= 3) {
      return 'nearing-expiry';
    } else {
      return 'fresh';
    }
  };

  return (
    <div className="item-list-container">
      <h2>My Food Inventory</h2>
      {sortedItems.length === 0 ? (
        <p>No items in your inventory yet. Add some!</p>
      ) : (
        <ul className="food-items-list">
          {sortedItems.map((item) => (
            <li key={item.id} className={`food-item-card ${getExpiryStatus(item.expiry)}`}>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>Category: {item.category || 'N/A'}</p>
                <p>Quantity: {item.quantity} {item.unit}</p>
                <p>Expires: {new Date(item.expiry).toLocaleDateString()}</p>
              </div>
              <button onClick={() => onRemoveItem(item.id)} className="remove-button">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FoodItemList;