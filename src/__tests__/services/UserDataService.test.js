/**
 * UserDataService.test.js
 * Unit tests for the UserDataService
 */
import UserDataService from '../../services/UserDataService';
import MyceliumDataService from '../../services/MyceliumDataService';

// Mock MyceliumDataService
jest.mock('../../services/MyceliumDataService', () => ({
  experienceLevels: [
    { id: 'beginner', label: 'Beginner', recommendations: ['Beginner tip 1', 'Beginner tip 2'] },
    { id: 'intermediate', label: 'Intermediate', recommendations: ['Intermediate tip 1'] },
    { id: 'advanced', label: 'Advanced', recommendations: ['Advanced tip 1'] }
  ],
  substrateTypes: [
    { 
      id: 'cvg', 
      label: 'CVG', 
      recommendations: ['CVG tip'],
      ingredients: [
        { name: 'Coir', ratio: 0.5, unit: 'kg' },
        { name: 'Vermiculite', ratio: 0.3, unit: 'kg' },
        { name: 'Gypsum', ratio: 0.02, unit: 'kg' }
      ]
    },
    { 
      id: 'manure', 
      label: 'Manure', 
      recommendations: ['Manure tip'],
      ingredients: [
        { name: 'Manure', ratio: 0.6, unit: 'kg' },
        { name: 'Straw', ratio: 0.2, unit: 'kg' }
      ]
    }
  ],
  containerSizes: [
    { size: 5, label: '5 quart', description: 'Small' },
    { size: 10, label: '10 quart', description: 'Medium' },
    { size: 20, label: '20 quart', description: 'Large' }
  ],
  calculateIngredients: jest.fn().mockImplementation((substrateType, substrateVolume) => {
    if (substrateType === 'cvg') {
      return [
        { name: 'Coir', amount: 0.5 * substrateVolume, unit: 'kg' },
        { name: 'Vermiculite', amount: 0.3 * substrateVolume, unit: 'kg' },
        { name: 'Gypsum', amount: 0.02 * substrateVolume, unit: 'kg' }
      ];
    } else {
      return [
        { name: 'Manure', amount: 0.6 * substrateVolume, unit: 'kg' },
        { name: 'Straw', amount: 0.2 * substrateVolume, unit: 'kg' }
      ];
    }
  })
}));

describe('UserDataService', () => {
  // Save original localStorage methods
  const originalLocalStorage = global.localStorage;
  
  beforeEach(() => {
    // Mock localStorage
    global.localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    
    // Reset UserDataService to defaults
    UserDataService.resetToDefaults();
  });
  
  afterEach(() => {
    // Restore original localStorage
    global.localStorage = originalLocalStorage;
  });
  
  describe('initialization', () => {
    test('should initialize with default values', () => {
      expect(UserDataService.userData).toEqual({
        experienceLevel: 'beginner',
        spawnAmount: 1,
        substrateRatio: 2,
        substrateType: 'cvg',
        containerSize: 5
      });
      
      // Should have calculated results
      expect(UserDataService.results).toBeDefined();
      expect(UserDataService.results.ingredients).toBeDefined();
      
      // Should have recommendations
      expect(UserDataService.recommendations).toBeDefined();
    });
  });
  
  describe('updateUserData', () => {
    test('should update a single field', () => {
      UserDataService.updateUserData('spawnAmount', 2);
      expect(UserDataService.userData.spawnAmount).toBe(2);
      
      // Results should be recalculated
      expect(UserDataService.results.substrateVolume).toBeDefined();
    });
    
    test('should update experience level and recommendations', () => {
      UserDataService.updateUserData('experienceLevel', 'advanced');
      expect(UserDataService.userData.experienceLevel).toBe('advanced');
      
      // Recommendations should be updated
      expect(UserDataService.recommendations).toContain('Advanced tip 1');
    });
    
    test('should update substrate type and recalculate ingredients', () => {
      UserDataService.updateUserData('substrateType', 'manure');
      expect(UserDataService.userData.substrateType).toBe('manure');
      
      // Ingredients should be updated
      const manureIngredient = UserDataService.results.ingredients.find(i => i.name === 'Manure');
      expect(manureIngredient).toBeDefined();
    });
  });
  
  describe('calculateResults', () => {
    test('should calculate correct substrate volume', () => {
      UserDataService.updateUserData('spawnAmount', 2);
      UserDataService.updateUserData('substrateRatio', 3);
      
      // Substrate volume should be spawn amount * ratio
      expect(parseFloat(UserDataService.results.substrateVolume)).toBe(6);
    });
    
    test('should calculate correct total mix volume', () => {
      UserDataService.updateUserData('spawnAmount', 2);
      UserDataService.updateUserData('substrateRatio', 3);
      
      // Total mix volume should be spawn amount + substrate volume
      expect(parseFloat(UserDataService.results.totalMixVolume)).toBe(8);
    });
    
    test('should calculate correct container fill percentage', () => {
      UserDataService.updateUserData('spawnAmount', 2);
      UserDataService.updateUserData('substrateRatio', 3);
      UserDataService.updateUserData('containerSize', 10);
      
      // Container fill percentage should be (total mix volume / container size) * 100
      expect(parseFloat(UserDataService.results.containerFill)).toBe(80);
    });
  });
  
  describe('localStorage integration', () => {
    test('should save to localStorage', () => {
      UserDataService.updateUserData('spawnAmount', 3);
      UserDataService.saveToLocalStorage();
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mycelium_user_data',
        expect.any(String)
      );
      
      // The saved data should include the updated spawn amount
      const savedData = JSON.parse(localStorage.setItem.mock.calls[0][1]);
      expect(savedData.userData.spawnAmount).toBe(3);
    });
    
    test('should load from localStorage', () => {
      // Mock localStorage.getItem to return saved data
      localStorage.getItem.mockReturnValue(JSON.stringify({
        userData: {
          experienceLevel: 'intermediate',
          spawnAmount: 4,
          substrateRatio: 5,
          substrateType: 'manure',
          containerSize: 20
        }
      }));
      
      UserDataService.loadFromLocalStorage();
      
      // UserDataService should be updated with the loaded data
      expect(UserDataService.userData.experienceLevel).toBe('intermediate');
      expect(UserDataService.userData.spawnAmount).toBe(4);
      expect(UserDataService.userData.substrateRatio).toBe(5);
      expect(UserDataService.userData.substrateType).toBe('manure');
      expect(UserDataService.userData.containerSize).toBe(20);
    });
    
    test('should handle missing localStorage data', () => {
      // Mock localStorage.getItem to return null (no saved data)
      localStorage.getItem.mockReturnValue(null);
      
      // Save the current state to compare later
      const originalState = { ...UserDataService.userData };
      
      UserDataService.loadFromLocalStorage();
      
      // UserDataService should remain unchanged
      expect(UserDataService.userData).toEqual(originalState);
    });
  });
  
  describe('resetToDefaults', () => {
    test('should reset to default values', () => {
      // First update some values
      UserDataService.updateUserData('spawnAmount', 5);
      UserDataService.updateUserData('experienceLevel', 'advanced');
      
      // Then reset
      UserDataService.resetToDefaults();
      
      // Should be back to defaults
      expect(UserDataService.userData).toEqual({
        experienceLevel: 'beginner',
        spawnAmount: 1,
        substrateRatio: 2,
        substrateType: 'cvg',
        containerSize: 5
      });
    });
  });
  
  describe('getUserData and getResults', () => {
    test('getUserData should return the current user data', () => {
      // Update some values
      UserDataService.updateUserData('spawnAmount', 3);
      
      // Get the user data
      const userData = UserDataService.getUserData();
      
      // Should match the current state
      expect(userData).toEqual(UserDataService.userData);
      expect(userData.spawnAmount).toBe(3);
    });
    
    test('getResults should return the current results', () => {
      // Update some values to change the results
      UserDataService.updateUserData('spawnAmount', 3);
      
      // Get the results
      const results = UserDataService.getResults();
      
      // Should match the current results
      expect(results).toEqual(UserDataService.results);
    });
    
    test('getRecommendations should return the current recommendations', () => {
      // Update experience level to change recommendations
      UserDataService.updateUserData('experienceLevel', 'intermediate');
      
      // Get the recommendations
      const recommendations = UserDataService.getRecommendations();
      
      // Should match the current recommendations
      expect(recommendations).toEqual(UserDataService.recommendations);
      expect(recommendations).toContain('Intermediate tip 1');
    });
  });
});
