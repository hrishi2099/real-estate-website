import { calculateLocalityScores, getCachedLocalityScores } from '../locality-scoring';

describe('Locality Scoring Algorithm', () => {
  const mockProperty = {
    id: 'test-1',
    location: 'Bandra West, Mumbai',
    latitude: 19.0596,
    longitude: 72.8295,
    price: 25000000, // 2.5 Cr
    area: 1200,
    type: 'apartment',
    yearBuilt: 2020
  };

  test('should return consistent scores for the same property', () => {
    const scores1 = calculateLocalityScores(mockProperty);
    const scores2 = calculateLocalityScores(mockProperty);
    
    // Scores should be similar (within variance range)
    expect(Math.abs(scores1.localityScore - scores2.localityScore)).toBeLessThanOrEqual(6);
    expect(Math.abs(scores1.walkScore - scores2.walkScore)).toBeLessThanOrEqual(8);
    expect(Math.abs(scores1.amenitiesScore - scores2.amenitiesScore)).toBeLessThanOrEqual(6);
  });

  test('should return cached scores for the same property', () => {
    const scores1 = getCachedLocalityScores(mockProperty);
    const scores2 = getCachedLocalityScores(mockProperty);
    
    expect(scores1).toEqual(scores2);
  });

  test('should give higher scores for premium locations', () => {
    const premiumProperty = {
      ...mockProperty,
      location: 'Bandra West, Mumbai', // Premium area
      price: 50000000 // 5 Cr
    };
    
    const normalProperty = {
      ...mockProperty,
      location: 'Patna', // Less premium city
      price: 8000000 // 80L
    };
    
    const premiumScores = calculateLocalityScores(premiumProperty);
    const normalScores = calculateLocalityScores(normalProperty);
    
    expect(premiumScores.localityScore).toBeGreaterThan(normalScores.localityScore);
  });

  test('should handle properties without optional fields', () => {
    const basicProperty = {
      id: 'test-2',
      location: 'Delhi',
      price: 8000000,
      type: 'house'
    };
    
    const scores = calculateLocalityScores(basicProperty);
    
    expect(scores.localityScore).toBeGreaterThan(0);
    expect(scores.walkScore).toBeGreaterThan(0);
    expect(scores.amenitiesScore).toBeGreaterThan(0);
  });

  test('should return scores within valid ranges', () => {
    const scores = calculateLocalityScores(mockProperty);
    
    expect(scores.localityScore).toBeGreaterThanOrEqual(40);
    expect(scores.localityScore).toBeLessThanOrEqual(99);
    
    expect(scores.walkScore).toBeGreaterThanOrEqual(30);
    expect(scores.walkScore).toBeLessThanOrEqual(99);
    
    expect(scores.amenitiesScore).toBeGreaterThanOrEqual(35);
    expect(scores.amenitiesScore).toBeLessThanOrEqual(99);
  });

  test('should give different scores for different property types', () => {
    const apartment = { 
      ...mockProperty, 
      type: 'apartment',
      location: 'Patna', // Use lower base city to avoid hitting max scores
      price: 8000000
    };
    const villa = { 
      ...mockProperty, 
      type: 'villa',
      location: 'Patna',
      price: 8000000
    };
    const commercial = { 
      ...mockProperty, 
      type: 'commercial',
      location: 'Patna',
      price: 8000000
    };
    
    const apartmentScores = calculateLocalityScores(apartment);
    const villaScores = calculateLocalityScores(villa);
    const commercialScores = calculateLocalityScores(commercial);
    
    // Apartments should have better walkability than villas
    expect(apartmentScores.walkScore).toBeGreaterThan(villaScores.walkScore);
    
    // Commercial should have excellent walkability
    expect(commercialScores.walkScore).toBeGreaterThan(apartmentScores.walkScore);
  });

  test('should consider city-based scoring', () => {
    const mumbaiProperty = { ...mockProperty, location: 'Mumbai' };
    const smallCityProperty = { ...mockProperty, location: 'Bhopal' };
    
    const mumbaiScores = calculateLocalityScores(mumbaiProperty);
    const smallCityScores = calculateLocalityScores(smallCityProperty);
    
    // Mumbai should generally have higher base scores
    expect(mumbaiScores.localityScore).toBeGreaterThan(smallCityScores.localityScore);
  });
});