import React from "react";
import "./AddFoodItem.css"; // ✅ optional, create this if you want custom styles

function AddFoodItem() {
  return (
    <div className="page-content">
      <h1>Add Food Item</h1>
      <form>
        <input type="text" placeholder="Food Name" />
        <input type="number" placeholder="Quantity" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default AddFoodItem;
