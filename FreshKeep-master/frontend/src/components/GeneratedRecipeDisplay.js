import React from 'react';

function GeneratedRecipeDisplay({ recipe }) {
  if (!recipe) {
    return null;
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

export default GeneratedRecipeDisplay;