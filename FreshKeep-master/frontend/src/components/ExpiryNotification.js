import React from 'react';

function ExpiryNotification({ nearingExpiryItems, onDismiss }) {
  if (nearingExpiryItems.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      <h3>Items Nearing Expiry! 🔔</h3>
      <p>The following items will expire soon:</p>
      <ul>
        {nearingExpiryItems.map(item => (
          <li key={item.id}>
            <strong>{item.name}</strong> - Expires on {new Date(item.expiry).toLocaleDateString()}
          </li>
        ))}
      </ul>
      <button onClick={onDismiss} className="dismiss-button">Dismiss</button>
    </div>
  );
}

export default ExpiryNotification;