export interface PropertyFeatureSet {
  [key: string]: string[];
}

export const PROPERTY_FEATURES: PropertyFeatureSet = {
  AGRICULTURAL_LAND: [
    // Land Quality & Soil
    'Fertile Soil',
    'Red Soil',
    'Black Cotton Soil',
    'Sandy Loam',
    'Well Drained Soil',
    'Soil Testing Done',

    // Water & Irrigation
    'Bore Well',
    'Open Well',
    'Canal Irrigation',
    'River Water Access',
    'Drip Irrigation Setup',
    'Water Storage Tank',
    'Tube Well',

    // Infrastructure & Access
    'Road Access',
    'Kutcha Road',
    'Pucca Road',
    'Highway Access',
    'Village Road',
    'All Weather Road',

    // Utilities
    'Electricity Connection',
    '3-Phase Connection',
    'Solar Power Setup',
    'Transformer Nearby',

    // Legal & Documentation
    'Clear Title',
    'Survey Settlement',
    'Pahani Records',
    '7/12 Extract',
    'Revenue Records',
    'Mutation Done',

    // Agricultural Features
    'Organic Certified',
    'Crop Insurance Available',
    'Mango Plantation',
    'Coconut Trees',
    'Teak Plantation',
    'Fruit Orchard',
    'Spice Cultivation',

    // Boundaries & Security
    'Fenced Property',
    'Stone Boundary',
    'Survey Stones',
    'Compound Wall',
    'Security Fencing',

    // Location Benefits
    'Near Market Yard',
    'Cold Storage Nearby',
    'Processing Unit Access',
    'Transport Hub Nearby',
    'Warehouse Facility',

    // Environmental
    'Pollution Free',
    'Wildlife Sanctuary Nearby',
    'Forest Border',
    'Hill View',
    'River View'
  ],

  NA_LAND: [
    // Land Classification
    'Non-Agricultural Use',
    'Residential Approved',
    'Commercial Approved',
    'Industrial Approved',
    'Mixed Use Approved',
    'IT/ITES Approved',

    // Development Status
    'Developed Plot',
    'Ready to Construct',
    'Under Development',
    'Layout Approved',
    'Building Plan Approved',
    'Construction Started',

    // Infrastructure
    'Road Access',
    'Internal Roads',
    'Tar Road',
    'Concrete Road',
    '30ft Road',
    '40ft Road',
    '60ft Road',
    'Corner Plot',
    'Face to Face Road',

    // Utilities Available
    'Electricity Connection',
    'Water Connection',
    'Sewage Connection',
    'Gas Pipeline',
    'Broadband Ready',
    'Cable TV Connection',

    // Civic Amenities
    'Street Lights',
    'Storm Water Drain',
    'Footpath',
    'Parks Nearby',
    'Playground Nearby',
    'Community Hall',

    // Legal & Approvals
    'Clear Title',
    'Approved Layout',
    'RERA Approved',
    'Bank Loan Approved',
    'Municipality Approved',
    'Gram Panchayat Approved',
    'Revenue Records Clear',
    'Survey Settlement',
    'Khata Transfer',

    // Location Advantages
    'Gated Community',
    'Security Guard',
    'CCTV Surveillance',
    'Boundary Wall',
    'Main Gate',

    // Proximity Benefits
    'School Nearby',
    'Hospital Nearby',
    'Shopping Mall',
    'Metro Station',
    'Bus Stop',
    'Railway Station',
    'Airport Access',
    'IT Hub Nearby',
    'Industrial Area',

    // Investment Features
    'High Appreciation',
    'Investment Zone',
    'Development Potential',
    'Commercial Potential',
    'Rental Income Potential',

    // Environmental
    'Lake View',
    'Hill View',
    'Park Facing',
    'Pollution Free',
    'Green Belt',
    'Tree Lined'
  ]
};

export const getFeaturesByPropertyType = (propertyType: string): string[] => {
  return PROPERTY_FEATURES[propertyType] || [];
};

export const getAllPropertyTypes = (): string[] => {
  return Object.keys(PROPERTY_FEATURES);
};

export const getPropertyTypeLabel = (propertyType: string): string => {
  const labels: { [key: string]: string } = {
    'AGRICULTURAL_LAND': 'Agricultural Land',
    'NA_LAND': 'NA Land'
  };
  return labels[propertyType] || propertyType;
};