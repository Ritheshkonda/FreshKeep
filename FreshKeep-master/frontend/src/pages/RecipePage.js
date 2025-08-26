import React, { useState } from 'react';
import GeneratedRecipeDisplay from '../components/GeneratedRecipeDisplay';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function RecipePage({ foodItems }) {
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateRecipe = async () => {
    // 💡 Mapped using `foodName` to match the data from your AddFoodItem.js
    const availableItems = foodItems.map(item => item.foodName);
    setGeneratedRecipe(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/generate-recipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory_items: availableItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const recipe = await response.json();
      setGeneratedRecipe(recipe);
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert(`Failed to generate recipe: ${error.message}`);
      setGeneratedRecipe({
        name: 'Generation Failed',
        ingredients: 'N/A',
        instructions: `Error: ${error.message}. Please check your backend server and API key.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container recipe-page">
      <h2>Generate Recipe from Inventory</h2>
      <p>Click the button below to generate a recipe based on your current food items.</p>
      <button 
        onClick={handleGenerateRecipe} 
        className="generate-recipe-button"
        disabled={loading} // Disable the button while loading
      >
        {loading ? 'Generating...' : 'Generate Recipe'}
      </button>
      <GeneratedRecipeDisplay recipe={generatedRecipe} />
    </div>
  );
}

export default RecipePage;