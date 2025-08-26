import React from 'react';
import AddFoodItem from '../components/AddFoodItem';
import './AddFoodPage.css';

function AddFoodPage({ onAddItem }) {
  return (
    <div className="add-food-page-container">
      <div className="add-item-form-card">
        <AddFoodItem onAddItem={onAddItem} />
      </div>
    </div>
  );
}

export default AddFoodPage;