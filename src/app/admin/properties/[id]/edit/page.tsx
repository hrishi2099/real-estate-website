"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";

interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  latitude?: number;
  longitude?: number;
  type: string;
  status: 'ACTIVE' | 'SOLD' | 'PENDING' | 'INACTIVE';
  bedrooms: number;
  bathrooms: number;
  area?: number;
  features: string[];
  images: Image[];
  isFeatured: boolean;
}

interface Image {
  url: string;
  alt: string;
}

interface PropertyData {
  title: string;
  price: number;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  features: string[];
  isFeatured: boolean;
  description?: string;
  latitude?: number;
  longitude?: number;
  area?: number;
}

interface ValidationError {
  path: (string | number)[];
  message: string;
}

export default function EditProperty() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    latitude: '',
    longitude: '',
    type: 'APARTMENT',
    status: 'ACTIVE' as 'ACTIVE' | 'SOLD' | 'PENDING' | 'INACTIVE',
    bedrooms: 1,
    bathrooms: 1,
    area: '',
    features: [] as string[],
    isFeatured: false
  });

  const propertyTypes = [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'HOUSE', label: 'House' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'CONDO', label: 'Condo' },
    { value: 'TOWNHOUSE', label: 'Townhouse' },
    { value: 'COMMERCIAL', label: 'Commercial' },
    { value: 'LAND', label: 'Land' }
  ];

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'SOLD', label: 'Sold' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'INACTIVE', label: 'Inactive' }
  ];

  const availableFeatures = [
    'Swimming Pool', 'Garage', 'Garden', 'Balcony', 'Fireplace',
    'Air Conditioning', 'Heating', 'Dishwasher', 'Laundry Room',
    'Walk-in Closet', 'Security System', 'Gym/Fitness Center'
  ];

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        const response = await api.getProperty(propertyId);
        console.log('API Response:', response); // Debug log
        if (response?.data) {
          // Handle both possible response structures
          const propertyData: Property = (response.data as any).property || response.data;
          console.log('Property Data:', propertyData); // Debug log
          
          if (propertyData && propertyData.id) {
            setProperty(propertyData);
          
            // Populate form data
            setFormData({
              title: propertyData.title || '',
              description: propertyData.description || '',
              price: propertyData.price?.toString() || '',
              location: propertyData.location || '',
              latitude: propertyData.latitude?.toString() || '',
              longitude: propertyData.longitude?.toString() || '',
              type: propertyData.type || 'APARTMENT',
              status: propertyData.status || 'ACTIVE',
              bedrooms: propertyData.bedrooms || 1,
              bathrooms: propertyData.bathrooms || 1,
              area: propertyData.area?.toString() || '',
              features: propertyData.features || [],
              isFeatured: propertyData.isFeatured || false
            });
          } else {
            console.log('Property data not found or invalid:', propertyData);
            alert('Property not found');
            router.push('/admin/properties');
          }
        } else {
          console.log('Property not found in response:', response); // Debug log
          alert('Property not found');
          router.push('/admin/properties');
        }
      } catch (error) {
        console.error("Failed to load property:", error);
        alert('Failed to load property');
        router.push('/admin/properties');
      } finally {
        setLoading(false);
      }
    };
    loadProperty();
  }, [propertyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid number greater than 0';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.area && formData.area.trim()) {
      if (isNaN(Number(formData.area)) || Number(formData.area) <= 0) {
        newErrors.area = 'Area must be a valid number greater than 0';
      }
    }
    
    if (formData.latitude && formData.latitude.trim()) {
      const lat = Number(formData.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = 'Latitude must be between -90 and 90';
      }
    }
    
    if (formData.longitude && formData.longitude.trim()) {
      const lng = Number(formData.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = 'Longitude must be between -180 and 180';
      }
    }
    
    if (isNaN(Number(formData.bedrooms)) || Number(formData.bedrooms) < 0) {
      newErrors.bedrooms = 'Bedrooms must be a valid number 0 or greater';
    }
    
    if (isNaN(Number(formData.bathrooms)) || Number(formData.bathrooms) < 0) {
      newErrors.bathrooms = 'Bathrooms must be a valid number 0 or greater';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // Only include fields that have values or need to be updated
      const propertyData: PropertyData = {
        title: formData.title.trim(),
        price: Number(formData.price),
        location: formData.location.trim(),
        type: formData.type,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        features: formData.features,
        isFeatured: formData.isFeatured
      };

      // Only include optional fields if they have values
      if (formData.description && formData.description.trim()) {
        propertyData.description = formData.description.trim();
      }
      
      if (formData.latitude && formData.latitude.trim()) {
        propertyData.latitude = Number(formData.latitude);
      }
      
      if (formData.longitude && formData.longitude.trim()) {
        propertyData.longitude = Number(formData.longitude);
      }
      
      if (formData.area && formData.area.trim()) {
        propertyData.area = Number(formData.area);
      }

      const response = await api.updateProperty(propertyId, propertyData);
      if (response?.data) {
        alert('Property updated successfully!');
        router.push('/admin/properties');
      } else {
        const errorMessage = response?.error || 'Failed to update property. Please check all fields and try again.';
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error updating property:', error);
      
      if (error?.response?.data?.details) {
        const validationErrors: ValidationError[] = error.response.data.details;
        const errorMessages = validationErrors.map((err: ValidationError) => `${err.path?.join('.')}: ${err.message}`);
        alert(`Validation Error:\n${errorMessages.join('\n')}`);
      } else if (error?.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else if (error?.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to update property. Please check your internet connection and try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading property...</span>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Property not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Properties
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter property title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="₹45,00,000"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Downtown, City Center"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Featured Property</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                  errors.bedrooms ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.bedrooms && <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                min="0"
                step="0.5"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                  errors.bathrooms ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.bathrooms && <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (sqft)
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                  errors.area ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1,200"
              />
              {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                step="any"
                min="-90"
                max="90"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                  errors.latitude ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="19.076"
              />
              {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
              <p className="text-xs text-gray-500 mt-1">GPS latitude coordinate (-90 to 90)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                step="any"
                min="-180"
                max="180"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                  errors.longitude ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="72.878"
              />
              {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
              <p className="text-xs text-gray-500 mt-1">GPS longitude coordinate (-180 to 180)</p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              placeholder="Describe the property..."
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Features</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableFeatures.map(feature => (
              <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={() => handleFeatureToggle(feature)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm text-gray-700">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Update Property'}
          </button>
        </div>
      </form>
    </div>
  );
}