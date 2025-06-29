// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

// --- Existing: AddFoodItem Component ---
function AddFoodItem({ onAddItem }) {
  const [itemName, setItemName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('count');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!itemName || !expiryDate) {
      alert('Please enter item name and expiry date.');
      return;
    }
    const newItemData = {
      name: itemName,
      expiry: expiryDate,
      category: category || null,
      quantity: quantity ? parseFloat(quantity) : null,
      unit: unit === 'count' ? null : unit,
    };
    onAddItem(newItemData);
    setItemName('');
    setExpiryDate('');
    setCategory('');
    setQuantity('');
    setUnit('count');
  };

  return (
    <div className="add-item-container">
      <h2>Add New Food Item</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="itemName">Item Name:</label>
          <input
            type="text"
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="e.g., Milk, Spinach"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="expiryDate">Expiry Date:</label>
          <input
            type="date"
            id="expiryDate"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="Dairy">Dairy</option>
            <option value="Produce">Produce</option>
            <option value="Meat">Meat</option>
            <option value="Pantry">Pantry</option>
            <option value="Frozen">Frozen</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group quantity-group">
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0"
          />
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          >
            <option value="count">Count</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
            <option value="pack">Pack</option>
            <option value="bag">Bag</option>
          </select>
        </div>
        <button type="submit" className="add-button">Add Item</button>
      </form>
    </div>
  );
}

// --- Existing: FoodItemList Component ---
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

// --- Existing: ExpiryNotification Component ---
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

// --- NEW: GeneratedRecipeDisplay Component ---
function GeneratedRecipeDisplay({ recipe }) {
  if (!recipe) {
    return null; // Don't render if no recipe is generated yet
  }

  return (
    <div className="generated-recipe-display-container">
      <h2>Generated Recipe: {recipe.name}</h2>
      <div className="recipe-details">
        <h4>Ingredients:</h4>
        <p>{recipe.ingredients}</p>
        <h4>Instructions:</h4>
        <p className="instructions-text">{recipe.instructions}</p>
      </div>
    </div>
  );
}

// --- Main App Component ---
function App() {
  const [foodItems, setFoodItems] = useState([]);
  const [nearingExpiryItems, setNearingExpiryItems] = useState([]);
  const [showExpiryNotification, setShowExpiryNotification] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState(null); // NEW: State for the generated recipe

  // Fetching Functions (Existing)
  const fetchAllItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setFoodItems(data);
    } catch (error) {
      console.error('Error fetching all food items:', error);
    }
  };

  const fetchNearingExpiryItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/nearing-expiry?days=7`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setNearingExpiryItems(data);
      setShowExpiryNotification(data.length > 0);
    } catch (error) {
      console.error('Error fetching nearing expiry items:', error);
    }
  };

  // NEW: Function to Generate Recipe
  const handleGenerateRecipe = async () => {
    const availableItems = foodItems.map(item => item.name); // Get names of all items in inventory
    setGeneratedRecipe(null); // Clear previous generated recipe

    try {
      const response = await fetch(`${API_BASE_URL}/generate-recipe`, { // Corrected endpoint path
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory_items: availableItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const recipe = await response.json();
      setGeneratedRecipe(recipe); // Set the generated recipe state
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert(`Failed to generate recipe: ${error.message}`);
      setGeneratedRecipe({ // Provide a fallback message if API fails
        name: 'Generation Failed',
        ingredients: 'N/A',
        instructions: `Error: ${error.message}. Please check your backend server and API key.`
      });
    }
  };


  // useEffect to run on component mount
  useEffect(() => {
    fetchAllItems();
    fetchNearingExpiryItems();
  }, []);

  // Handlers for Add/Remove Items (Existing)
  const handleAddItem = async (newItemData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const addedItem = await response.json();
      // Optimization: No need to re-fetch all if you just added one
      setFoodItems((prevItems) => [...prevItems, addedItem]);
      alert(`${addedItem.name} added to your inventory!`);
      // Re-fetch only nearing expiry as needed
      fetchNearingExpiryItems();
      // No need to re-generate recipe immediately, user will click button
    } catch (error) {
      console.error('Error adding food item:', error);
      alert(`Failed to add item: ${error.message}`);
    }
  };

  const handleRemoveItem = async (idToRemove) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${idToRemove}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      setFoodItems((prevItems) => prevItems.filter(item => item.id !== idToRemove));
      alert('Item removed successfully!');
      // Re-fetch only nearing expiry as needed
      fetchNearingExpiryItems();
      setGeneratedRecipe(null); // Clear generated recipe if inventory changes significantly
    } catch (error) {
      console.error('Error removing food item:', error);
      alert(`Failed to remove item: ${error.message}`);
    }
  };

  const handleDismissNotification = () => {
    setShowExpiryNotification(false);
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>FreshKeep 🍎</h1>
        <p>Your Smart Food Manager</p>
      </header>

      {showExpiryNotification && (
        <ExpiryNotification
          nearingExpiryItems={nearingExpiryItems}
          onDismiss={handleDismissNotification}
        />
      )}

      <main>
        {/* Inventory Section */}
        <div className="section-container inventory-section">
          <AddFoodItem onAddItem={handleAddItem} />
          <FoodItemList items={foodItems} onRemoveItem={handleRemoveItem} />
        </div>

        {/* Recipe Generation Section */}
        <div className="section-container recipe-generation-section">
          <h2>Generate Recipe from Inventory</h2>
          <p>Click the button below to generate a recipe based on your current food items.</p>
          <button onClick={handleGenerateRecipe} className="generate-recipe-button">
            Generate Recipe
          </button>
          <GeneratedRecipeDisplay recipe={generatedRecipe} />
        </div>
      </main>
    </div>
  );
}

export default App;