/**
 * MyceliumDataService.test.js
 * Unit tests for the MyceliumDataService
 */
import MyceliumDataService from '../../services/MyceliumDataService';

describe('MyceliumDataService', () => {
  describe('data structures', () => {
    test('should have experience levels defined', () => {
      expect(MyceliumDataService.experienceLevels).toBeDefined();
      expect(MyceliumDataService.experienceLevels.length).toBeGreaterThan(0);
      
      // Each experience level should have required properties
      MyceliumDataService.experienceLevels.forEach(level => {
        expect(level).toHaveProperty('id');
        expect(level).toHaveProperty('label');
        expect(level).toHaveProperty('recommendations');
        expect(Array.isArray(level.recommendations)).toBe(true);
      });
    });
    
    test('should have substrate types defined', () => {
      expect(MyceliumDataService.substrateTypes).toBeDefined();
      expect(MyceliumDataService.substrateTypes.length).toBeGreaterThan(0);
      
      // Each substrate type should have required properties
      MyceliumDataService.substrateTypes.forEach(type => {
        expect(type).toHaveProperty('id');
        expect(type).toHaveProperty('label');
        expect(type).toHaveProperty('ingredients');
        expect(Array.isArray(type.ingredients)).toBe(true);
        
        // Each ingredient should have required properties
        type.ingredients.forEach(ingredient => {
          expect(ingredient).toHaveProperty('name');
          expect(ingredient).toHaveProperty('ratio');
          expect(ingredient).toHaveProperty('unit');
        });
      });
    });
    
    test('should have container sizes defined', () => {
      expect(MyceliumDataService.containerSizes).toBeDefined();
      expect(MyceliumDataService.containerSizes.length).toBeGreaterThan(0);
      
      // Each container size should have required properties
      MyceliumDataService.containerSizes.forEach(container => {
        expect(container).toHaveProperty('size');
        expect(container).toHaveProperty('label');
        expect(container).toHaveProperty('description');
      });
    });
    
    test('should have cultivation tips defined', () => {
      expect(MyceliumDataService.cultivationTips).toBeDefined();
      expect(MyceliumDataService.cultivationTips.length).toBeGreaterThan(0);
      
      // Each tip should be a string
      MyceliumDataService.cultivationTips.forEach(tip => {
        expect(typeof tip).toBe('string');
      });
    });
  });
  
  describe('calculateSubstrateIngredients', () => {
    test('should calculate ingredients for CVG substrate', () => {
      const substrateType = 'cvg';
      const substrateVolume = 5;
      
      const ingredients = MyceliumDataService.calculateSubstrateIngredients(substrateType, substrateVolume);
      
      // Should return an array of ingredients
      expect(Array.isArray(ingredients)).toBe(true);
      expect(ingredients.length).toBeGreaterThan(0);
      
      // Should include coir, vermiculite, and gypsum for CVG
      const coir = ingredients.find(i => i.name === 'Coir');
      const vermiculite = ingredients.find(i => i.name === 'Vermiculite');
      const gypsum = ingredients.find(i => i.name === 'Gypsum');
      
      expect(coir).toBeDefined();
      expect(vermiculite).toBeDefined();
      expect(gypsum).toBeDefined();
      
      // Amounts should be calculated based on ratios and volume
      expect(coir.amount).toBeGreaterThan(0);
      expect(vermiculite.amount).toBeGreaterThan(0);
      expect(gypsum.amount).toBeGreaterThan(0);
    });
    
    test('should calculate ingredients for manure-based substrate', () => {
      const substrateType = 'manure';
      const substrateVolume = 5;
      
      const ingredients = MyceliumDataService.calculateSubstrateIngredients(substrateType, substrateVolume);
      
      // Should return an array of ingredients
      expect(Array.isArray(ingredients)).toBe(true);
      expect(ingredients.length).toBeGreaterThan(0);
      
      // Should include manure for manure-based substrate
      const manure = ingredients.find(i => i.name === 'Manure');
      expect(manure).toBeDefined();
      expect(manure.amount).toBeGreaterThan(0);
    });
    
    test('should handle unknown substrate type', () => {
      const substrateType = 'unknown';
      const substrateVolume = 5;
      
      const ingredients = MyceliumDataService.calculateSubstrateIngredients(substrateType, substrateVolume);
      
      // Should return an empty array for unknown substrate type
      expect(Array.isArray(ingredients)).toBe(true);
      expect(ingredients.length).toBe(0);
    });
    
    test('should handle zero volume', () => {
      const substrateType = 'cvg';
      const substrateVolume = 0;
      
      const ingredients = MyceliumDataService.calculateSubstrateIngredients(substrateType, substrateVolume);
      
      // Should return ingredients with zero amounts
      expect(Array.isArray(ingredients)).toBe(true);
      ingredients.forEach(ingredient => {
        expect(ingredient.amount).toBe(0);
      });
    });
  });
  
  describe('getRecommendationsByExperience', () => {
    test('should return recommendations for beginner', () => {
      const recommendations = MyceliumDataService.getRecommendationsByExperience('beginner');
      
      // Should return an array of recommendations
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should match the recommendations in the experience level data
      const beginnerLevel = MyceliumDataService.experienceLevels.find(level => level.id === 'beginner');
      expect(recommendations).toEqual(beginnerLevel.recommendations);
    });
    
    test('should return recommendations for intermediate', () => {
      const recommendations = MyceliumDataService.getRecommendationsByExperience('intermediate');
      
      // Should return an array of recommendations
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should match the recommendations in the experience level data
      const intermediateLevel = MyceliumDataService.experienceLevels.find(level => level.id === 'intermediate');
      expect(recommendations).toEqual(intermediateLevel.recommendations);
    });
    
    test('should return recommendations for expert', () => {
      const recommendations = MyceliumDataService.getRecommendationsByExperience('expert');
      
      // Should return an array of recommendations
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should match the recommendations in the experience level data
      const expertLevel = MyceliumDataService.experienceLevels.find(level => level.id === 'expert');
      expect(recommendations).toEqual(expertLevel.recommendations);
    });
    
    test('should handle unknown experience level', () => {
      const recommendations = MyceliumDataService.getRecommendationsByExperience('unknown');
      
      // Should return an empty array for unknown experience level
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBe(0);
    });
  });
});
