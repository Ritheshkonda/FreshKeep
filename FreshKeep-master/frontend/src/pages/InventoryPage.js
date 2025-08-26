import React from 'react';
import FoodItemList from '../components/FoodItemList';

function InventoryPage({ foodItems, onRemoveItem }) {
  return (
    <div className="section-container inventory-page">
      <FoodItemList items={foodItems} onRemoveItem={onRemoveItem} />
    </div>
  );
}

export default InventoryPage;