/**
 * UserDataService.js
 * 
 * This service manages user-selected data and calculation results
 * for the Mycelium Mix Calculator.
 */

import MyceliumDataService from './MyceliumDataService';

class UserDataService {
  constructor() {
    // Default user selections
    this.userData = {
      experienceLevel: 'beginner',
      spawnAmount: 1,
      substrateRatio: 2,
      substrateType: 'cvg',
      containerSize: 5,
    };

    // Calculation results
    this.results = {
      substrateVolume: '2.0',
      totalMixVolume: '3.0',
      containerFill: '60.0',
      optimalMonotubVolume: '6.0',
      ingredients: []
    };

    // Recommendations based on experience level
    this.recommendations = [];

    // Initialize with default values
    this.updateRecommendations();
    this.calculateResults();
  }

  /**
   * Update a specific user data field
   * @param {string} field - The field to update
   * @param {any} value - The new value
   */
  updateUserData(field, value) {
    // Update the specified field
    this.userData[field] = value;

    // If experience level changes, update substrate ratio and recommendations
    if (field === 'experienceLevel') {
      const selectedLevel = MyceliumDataService.experienceLevels.find(
        level => level.id === value
      );
      if (selectedLevel) {
        this.userData.substrateRatio = selectedLevel.defaultSubstrateRatio;
      }
      this.updateRecommendations();
    }

    // Recalculate results after any field update
    this.calculateResults();

    return this.userData;
  }

  /**
   * Get the current user data
   * @returns {Object} The current user data
   */
  getUserData() {
    return this.userData;
  }

  /**
   * Get the current calculation results
   * @returns {Object} The current calculation results
   */
  getResults() {
    return this.results;
  }

  /**
   * Get the current recommendations
   * @returns {Array} The current recommendations
   */
  getRecommendations() {
    return this.recommendations;
  }

  /**
   * Update recommendations based on current experience level
   */
  updateRecommendations() {
    this.recommendations = MyceliumDataService.getRecommendationsByExperience(
      this.userData.experienceLevel
    );
  }

  /**
   * Calculate results based on current user data
   */
  calculateResults() {
    const { spawnAmount, substrateRatio, substrateType, containerSize } = this.userData;
    
    const substrateVolume = (spawnAmount * substrateRatio).toFixed(1);
    const totalMixVolume = (parseFloat(spawnAmount) + parseFloat(substrateVolume)).toFixed(1);
    const containerFill = ((totalMixVolume / containerSize) * 100).toFixed(1);
    
    // Calculate optimal monotub volume (total mix volume * 2 for headspace)
    const optimalMonotubVolume = (parseFloat(totalMixVolume) * 2).toFixed(1);
    
    // Get ingredients based on substrate type and volume
    const ingredients = MyceliumDataService.calculateSubstrateIngredients(
      substrateType, 
      substrateVolume
    );

    this.results = {
      spawnAmount,
      substrateVolume,
      totalMixVolume,
      containerFill,
      optimalMonotubVolume,
      ingredients
    };

    return this.results;
  }

  /**
   * Save the current user data to localStorage
   */
  saveToLocalStorage() {
    try {
      localStorage.setItem('myceliumCalculatorData', JSON.stringify(this.userData));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  /**
   * Load user data from localStorage
   * @returns {boolean} Whether the load was successful
   */
  loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('myceliumCalculatorData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Update each field individually to trigger proper updates
        Object.keys(parsedData).forEach(key => {
          this.updateUserData(key, parsedData[key]);
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return false;
    }
  }

  /**
   * Reset user data to defaults
   */
  resetToDefaults() {
    this.userData = {
      experienceLevel: 'beginner',
      spawnAmount: 1,
      substrateRatio: 2,
      substrateType: 'cvg',
      containerSize: 5,
    };
    this.updateRecommendations();
    this.calculateResults();
    return this.userData;
  }
}

// Create a singleton instance
const userDataServiceInstance = new UserDataService();

export default userDataServiceInstance;
