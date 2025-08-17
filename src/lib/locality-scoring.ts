/**
 * Custom Locality Scoring Algorithm
 * Calculates realistic locality assessment scores based on property characteristics
 */

interface PropertyData {
  id: string;
  location: string;
  latitude?: number;
  longitude?: number;
  price: number;
  area?: number;
  type: string;
  yearBuilt?: number;
}

interface LocalityScores {
  localityScore: number;
  walkScore: number;
  amenitiesScore: number;
}

// City scoring data type
interface CityData {
  base: number;
  walkability: number;
  amenities: number;
}

// Location-based scoring weights for major Indian cities
const CITY_SCORING_DATA: Record<string, CityData> = {
  // Metro cities get higher base scores
  'mumbai': { base: 85, walkability: 80, amenities: 90 },
  'delhi': { base: 82, walkability: 75, amenities: 88 },
  'bangalore': { base: 80, walkability: 70, amenities: 85 },
  'hyderabad': { base: 78, walkability: 68, amenities: 82 },
  'pune': { base: 76, walkability: 72, amenities: 80 },
  'chennai': { base: 75, walkability: 70, amenities: 78 },
  'kolkata': { base: 74, walkability: 75, amenities: 76 },
  'ahmedabad': { base: 72, walkability: 65, amenities: 74 },
  'jaipur': { base: 70, walkability: 60, amenities: 72 },
  'lucknow': { base: 68, walkability: 58, amenities: 70 },
  'kanpur': { base: 66, walkability: 55, amenities: 68 },
  'nagpur': { base: 65, walkability: 57, amenities: 67 },
  'indore': { base: 64, walkability: 56, amenities: 66 },
  'thane': { base: 78, walkability: 72, amenities: 82 },
  'bhopal': { base: 62, walkability: 54, amenities: 64 },
  'visakhapatnam': { base: 61, walkability: 53, amenities: 63 },
  'pimpri': { base: 74, walkability: 68, amenities: 76 },
  'patna': { base: 58, walkability: 50, amenities: 60 },
  'vadodara': { base: 67, walkability: 60, amenities: 69 },
  'ghaziabad': { base: 65, walkability: 58, amenities: 67 },
  // Default for smaller cities/towns
  'default': { base: 60, walkability: 50, amenities: 62 }
};

// High-value area keywords that boost scores
const PREMIUM_AREA_KEYWORDS = [
  'bandra', 'juhu', 'powai', 'hiranandani', 'worli', 'lower parel', 'bkc',
  'gurgaon', 'cyber city', 'mg road', 'connaught place', 'vasant kunj',
  'koramangala', 'indiranagar', 'whitefield', 'electronic city', 'hsr layout',
  'banjara hills', 'jubilee hills', 'gachibowli', 'hitec city',
  'boat club road', 'kalyani nagar', 'aundh', 'viman nagar',
  'anna nagar', 't nagar', 'adyar', 'velachery',
  'salt lake', 'new town', 'rajarhat',
  'vastrapur', 'prahlad nagar', 'satellite',
  'civil lines', 'cantonment', 'gomti nagar'
];

// Commercial/IT hub keywords that boost walkability and amenities
const COMMERCIAL_HUB_KEYWORDS = [
  'it park', 'tech park', 'cyber', 'software', 'business district',
  'commercial', 'mall', 'metro', 'station', 'airport', 'highway',
  'expressway', 'ring road', 'main road', 'market', 'hospital',
  'school', 'college', 'university'
];

/**
 * Determines city from location string
 */
function getCityFromLocation(location: string): string {
  const locationLower = location.toLowerCase();
  
  for (const city of Object.keys(CITY_SCORING_DATA)) {
    if (city !== 'default' && locationLower.includes(city)) {
      return city;
    }
  }
  
  return 'default';
}

/**
 * Calculates area premium based on location keywords
 */
function calculateAreaPremium(location: string): number {
  const locationLower = location.toLowerCase();
  let premium = 0;
  
  // Premium area boost
  for (const keyword of PREMIUM_AREA_KEYWORDS) {
    if (locationLower.includes(keyword)) {
      premium += 8;
      break; // Only count once
    }
  }
  
  // Commercial hub boost
  for (const keyword of COMMERCIAL_HUB_KEYWORDS) {
    if (locationLower.includes(keyword)) {
      premium += 5;
      break; // Only count once
    }
  }
  
  return Math.min(premium, 15); // Cap at 15 points
}

/**
 * Calculates price-based scoring modifier
 */
function calculatePriceModifier(price: number, area?: number): number {
  // Calculate price per sq ft if area is available
  if (area && area > 0) {
    const pricePerSqft = price / area;
    
    // Higher price per sq ft typically indicates better locality
    if (pricePerSqft > 15000) return 10;      // Premium
    if (pricePerSqft > 10000) return 7;       // High-end
    if (pricePerSqft > 7000) return 4;        // Mid-range
    if (pricePerSqft > 4000) return 2;        // Budget+
    return 0;                                 // Budget
  }
  
  // Fallback to absolute price if no area data
  if (price > 50000000) return 8;             // 5+ Cr
  if (price > 20000000) return 6;             // 2-5 Cr
  if (price > 10000000) return 4;             // 1-2 Cr
  if (price > 5000000) return 2;              // 50L-1Cr
  return 0;                                   // Below 50L
}

/**
 * Calculates property type modifier
 */
function calculatePropertyTypeModifier(type: string): { locality: number; walk: number; amenities: number } {
  const typeLower = type.toLowerCase();
  
  switch (typeLower) {
    case 'villa':
    case 'house':
      return { locality: 5, walk: -5, amenities: -2 }; // Villas often in suburbs
    
    case 'apartment':
    case 'condo':
      return { locality: 3, walk: 5, amenities: 5 };   // Apartments usually well-connected
    
    case 'townhouse':
      return { locality: 2, walk: 0, amenities: 2 };   // Balanced
    
    case 'commercial':
      return { locality: -2, walk: 8, amenities: 8 };  // Great connectivity, less residential appeal
    
    case 'land':
      return { locality: -5, walk: -10, amenities: -8 }; // Raw land has minimal infrastructure
    
    default:
      return { locality: 0, walk: 0, amenities: 0 };
  }
}

/**
 * Calculates age-based modifier
 */
function calculateAgeModifier(yearBuilt?: number): number {
  if (!yearBuilt) return 0;
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - yearBuilt;
  
  if (age < 5) return 3;        // New construction
  if (age < 10) return 1;       // Recent
  if (age < 20) return 0;       // Established
  if (age < 30) return -2;      // Older
  return -4;                    // Very old
}

/**
 * Adds realistic variance to prevent identical scores
 */
function addVariance(baseScore: number, maxVariance: number = 5): number {
  const variance = (Math.random() - 0.5) * 2 * maxVariance;
  return Math.round(baseScore + variance);
}

/**
 * Ensures score is within valid range
 */
function clampScore(score: number, min: number = 30, max: number = 99): number {
  return Math.max(min, Math.min(max, score));
}

/**
 * Main function to calculate locality scores
 */
export function calculateLocalityScores(property: PropertyData): LocalityScores {
  const city = getCityFromLocation(property.location);
  const cityData = CITY_SCORING_DATA[city] || CITY_SCORING_DATA.default;
  
  // Base scores from city data
  let localityScore = cityData.base;
  let walkScore = cityData.walkability;
  let amenitiesScore = cityData.amenities;
  
  // Apply modifiers
  const areaPremium = calculateAreaPremium(property.location);
  const priceModifier = calculatePriceModifier(property.price, property.area);
  const typeModifier = calculatePropertyTypeModifier(property.type);
  const ageModifier = calculateAgeModifier(property.yearBuilt);
  
  // Calculate final scores
  localityScore += areaPremium + priceModifier + typeModifier.locality + ageModifier;
  walkScore += (areaPremium * 0.6) + (priceModifier * 0.5) + typeModifier.walk;
  amenitiesScore += (areaPremium * 0.8) + (priceModifier * 0.7) + typeModifier.amenities;
  
  // Add slight variance for realism
  localityScore = addVariance(localityScore, 3);
  walkScore = addVariance(walkScore, 4);
  amenitiesScore = addVariance(amenitiesScore, 3);
  
  // Clamp scores to valid ranges
  localityScore = clampScore(localityScore, 40, 99);
  walkScore = clampScore(walkScore, 30, 99);
  amenitiesScore = clampScore(amenitiesScore, 35, 99);
  
  return {
    localityScore,
    walkScore,
    amenitiesScore
  };
}

/**
 * Cached scoring to avoid recalculation on re-renders
 */
const scoreCache = new Map<string, LocalityScores>();

export function getCachedLocalityScores(property: PropertyData): LocalityScores {
  const cacheKey = `${property.id}-${property.location}-${property.price}-${property.type}`;
  
  if (scoreCache.has(cacheKey)) {
    return scoreCache.get(cacheKey)!;
  }
  
  const scores = calculateLocalityScores(property);
  scoreCache.set(cacheKey, scores);
  
  // Clear cache if it gets too large (prevent memory leaks)
  if (scoreCache.size > 1000) {
    const firstKey = scoreCache.keys().next().value;
    if (firstKey !== undefined) {
      scoreCache.delete(firstKey);
    }
  }
  
  return scores;
}