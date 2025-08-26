// src/pages/AddFoodItem.js

import React, { useState } from "react";

const AddFoodItem = ({ onAddFoodItem }) => {
  // Use state to manage the values of the form inputs
  const [foodName, setFoodName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevents the default form submission (page reload)

    // Check if all fields have been filled out
    if (!foodName || !quantity || !expiryDate) {
      alert("Please fill out all fields.");
      return;
    }

    // Create a new food item object from the state values
    const newItem = {
      foodName,
      quantity: Number(quantity), // Convert quantity to a number
      expiryDate,
    };

    // Pass the new item up to the parent component (App.js)
    onAddFoodItem(newItem);

    // Reset the form fields after submission
    setFoodName("");
    setQuantity("");
    setExpiryDate("");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Add Food Item</h2>
      {/* Attach the handleSubmit function to the form's onSubmit event */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Food Name"
          className="border rounded p-2 w-full"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantity"
          className="border rounded p-2 w-full"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          type="date"
          placeholder="Expiry Date"
          className="border rounded p-2 w-full"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Item
        </button>
      </form>
    </div>
  );
};

export default AddFoodItem;