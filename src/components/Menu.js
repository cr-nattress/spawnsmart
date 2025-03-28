import React from 'react';
import { Link } from 'react-router-dom';

const Menu = () => {
  return (
    <nav className="bg-green-800 text-white py-4 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="font-bold text-xl">SpawnSmart</div>
          <ul className="flex space-x-6">
            <li className="hover:text-green-300 transition-colors duration-200">
              <Link to="/">Home</Link>
            </li>
            <li className="hover:text-green-300 transition-colors duration-200">
              <Link to="/calculators">Calculators</Link>
            </li>
            <li className="hover:text-green-300 transition-colors duration-200">
              <Link to="/spore-finder">Spore Finder</Link>
            </li>
            <li className="hover:text-green-300 transition-colors duration-200">
              <Link to="/suppliers">Suppliers</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Menu;
