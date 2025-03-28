import React from 'react';

/**
 * ResultsPanel component for displaying calculation results and substrate ingredients
 * 
 * @param {Object} props Component props
 * @param {Object} props.results The calculation results object
 * @param {number} props.results.spawnAmount Spawn amount in quarts
 * @param {string} props.results.substrateVolume Substrate volume in quarts
 * @param {string} props.results.totalMixVolume Total mix volume in quarts
 * @param {string} props.results.containerFill Container fill percentage
 * @param {string} props.results.optimalMonotubVolume Optimal monotub volume in quarts
 * @param {Array} props.ingredients List of substrate ingredients with amounts
 * @returns {JSX.Element} The rendered ResultsPanel component
 */
const ResultsPanel = ({ results, ingredients }) => {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold">Results</h2>
      <div className="mt-4 mb-6 grid grid-cols-2 gap-4">
        <div>Spawn Amount: {results.spawnAmount} quarts</div>
        <div>Substrate Volume: {results.substrateVolume} quarts</div>
        <div>Total Mix Volume: {results.totalMixVolume} quarts</div>
        <div>Container Fill: {results.containerFill}%</div>
      </div>
      
      <h3 className="text-lg font-semibold mt-4">Optimal Monotub Size</h3>
      <div className="mt-2 mb-4">
        {results.optimalMonotubVolume} quarts
        <div className="text-sm text-gray-600 mt-1">
          Recommended container size providing adequate headspace for mushroom growth.
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mt-4">Substrate Ingredients</h3>
      <div className="mt-2 mb-4 grid grid-cols-2 gap-2">
        {ingredients.map((item, index) => (
          <div key={index}>{item.ingredient}: {item.amount} {item.unit}</div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPanel;
