// Mock data for testing when database is not available

export const mockProperties = [
  {
    id: "1",
    title: "Premium Land Plot in Mumbai",
    description: "Beautiful 10,000 sq ft land plot in prime location with excellent connectivity and all amenities nearby.",
    price: 15000000,
    location: "Andheri West, Mumbai",
    latitude: 19.1358,
    longitude: 72.8263,
    area: 10000,
    type: "LAND",
    status: "ACTIVE",
    isFeatured: true,
    bedrooms: null,
    bathrooms: null,
    yearBuilt: null,
    features: ["Corner Plot", "Clear Title", "Ready for Construction", "Near Metro Station", "Gated Community"],
    images: [
      {
        id: "img1",
        url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2232&q=80",
        filename: "land1.jpg",
        isPrimary: true
      },
      {
        id: "img2", 
        url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        filename: "land2.jpg",
        isPrimary: false
      }
    ],
    owner: {
      id: "owner1",
      name: "John Doe",
      email: "john@example.com"
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2", 
    title: "Commercial Land in Pune",
    description: "Excellent commercial land opportunity in developing area with high growth potential.",
    price: 25000000,
    location: "Hinjewadi, Pune",
    latitude: 18.5912,
    longitude: 73.7389,
    area: 15000,
    type: "COMMERCIAL",
    status: "ACTIVE",
    isFeatured: false,
    bedrooms: null,
    bathrooms: null,
    yearBuilt: null,
    features: ["Commercial Zone", "Wide Road Access", "IT Park Nearby", "Future Metro Connectivity"],
    images: [
      {
        id: "img3",
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        filename: "commercial1.jpg", 
        isPrimary: true
      }
    ],
    owner: {
      id: "owner2",
      name: "Jane Smith", 
      email: "jane@example.com"
    },
    createdAt: "2024-01-10T14:20:00Z",
    updatedAt: "2024-01-10T14:20:00Z"
  },
  {
    id: "3",
    title: "Residential Plot in Bangalore",
    description: "Prime residential plot in well-established neighborhood with all modern amenities.",
    price: 8500000,
    location: "Whitefield, Bangalore", 
    latitude: 12.9698,
    longitude: 77.7500,
    area: 5000,
    type: "LAND",
    status: "ACTIVE",
    isFeatured: true,
    bedrooms: null,
    bathrooms: null,
    yearBuilt: null,
    features: ["Residential Zone", "Park Facing", "24/7 Security", "Underground Utilities"],
    images: [
      {
        id: "img4",
        url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        filename: "residential1.jpg",
        isPrimary: true
      }
    ],
    owner: {
      id: "owner3", 
      name: "Mike Johnson",
      email: "mike@example.com"
    },
    createdAt: "2024-01-05T09:15:00Z",
    updatedAt: "2024-01-05T09:15:00Z"
  }
];

export function getMockProperty(id: string) {
  return mockProperties.find(p => p.id === id) || null;
}

export function getMockProperties(filters?: any) {
  return {
    properties: mockProperties,
    pagination: {
      page: 1,
      limit: 10,
      total: mockProperties.length,
      totalPages: 1
    }
  };
}