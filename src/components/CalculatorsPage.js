import React from 'react';
import { Link } from 'react-router-dom';

/**
 * CalculatorsPage component that displays all available calculators
 * 
 * @returns {JSX.Element} The rendered CalculatorsPage component
 */
const CalculatorsPage = () => {
  // Sample calculator data - in a real app, this might come from a service
  const calculators = [
    {
      id: 'spawn-calculator',
      title: 'Spawn-to-Substrate Calculator',
      description: 'Calculate the perfect spawn-to-substrate ratio for optimal yields and colonization times.',
      icon: '🧮',
      path: '/'
    },
    {
      id: 'humidity-calculator',
      title: 'Humidity Calculator',
      description: 'Determine the ideal humidity levels for different mushroom species and growth stages.',
      icon: '💧',
      path: '/humidity-calculator'
    },
    {
      id: 'yield-estimator',
      title: 'Yield Estimator',
      description: 'Estimate potential yields based on substrate volume, species, and growing conditions.',
      icon: '📊',
      path: '/yield-estimator'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full card bg-card-bg p-6 rounded-2xl shadow-md h-full">
        <h1 className="text-2xl font-bold mb-6">Mushroom Cultivation Calculators</h1>
        <p className="text-gray-600 mb-8">
          Our specialized calculators help you optimize every aspect of your mushroom cultivation process.
          Select a calculator below to get started.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map(calc => (
            <div key={calc.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">{calc.icon}</div>
              <h2 className="text-xl font-semibold mb-2">{calc.title}</h2>
              <p className="text-gray-600 mb-4">{calc.description}</p>
              <Link 
                to={calc.path} 
                className="inline-block bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Open Calculator
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalculatorsPage;
