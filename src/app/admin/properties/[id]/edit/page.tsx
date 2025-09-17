'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="border border-gray-300 rounded-lg p-3 h-32 bg-gray-50 animate-pulse">Loading editor...</div>
});

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    latitude: '',
    longitude: '',
    type: 'NA_LAND',
    status: 'ACTIVE' as 'ACTIVE' | 'SOLD' | 'PENDING' | 'INACTIVE',
    bedrooms: 1,
    bathrooms: 1,
    area: '',
    features: [] as string[],
    isFeatured: false,
    newImages: [] as File[],
    existingImages: [] as { url: string; alt: string }[]
  });

  const propertyTypes = [
    { value: 'NA_LAND', label: 'NA Land' },
    { value: 'AGRICULTURAL_LAND', label: 'Agricultural Land' }
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
              type: propertyData.type || 'NA_LAND',
              status: propertyData.status || 'ACTIVE',
              bedrooms: propertyData.bedrooms || 1,
              bathrooms: propertyData.bathrooms || 1,
              area: propertyData.area?.toString() || '',
              features: propertyData.features || [],
              isFeatured: propertyData.isFeatured || false,
              newImages: [],
              existingImages: propertyData.images || []
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

  const handleRemoveImage = (url: string) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter(image => image.url !== url)
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
    setUploadProgress(0);
    try {
      let newImageUrls: string[] = [];
      if (formData.newImages.length > 0) {
        setUploadingImages(true);
        const imageFormData = new FormData();
        formData.newImages.forEach(image => {
          imageFormData.append('files', image);
        });

        // Create XMLHttpRequest for progress tracking
        const uploadResponse = await new Promise<Response>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percentComplete);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(new Response(xhr.response, {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: new Headers(Object.fromEntries(
                  xhr.getAllResponseHeaders()
                    .split('\r\n')
                    .filter(line => line.includes(':'))
                    .map(line => line.split(': ', 2) as [string, string])
                ))
              }));
            } else {
              reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed: Network error'));
          });

          xhr.open('POST', '/api/upload');
          xhr.send(imageFormData);
        });

        if (!uploadResponse.ok) {
          throw new Error('Image upload failed');
        }

        const uploadResult = await uploadResponse.json();
        newImageUrls = uploadResult.files.map((file: any) => {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
          return new URL(file.url, baseUrl).href;
        });

        setUploadingImages(false);
        setUploadProgress(100);
      }

      const allImageUrls = [...formData.existingImages.map(img => img.url), ...newImageUrls];

      const propertyData = {
        title: formData.title.trim(),
        price: Number(formData.price),
        location: formData.location.trim(),
        type: formData.type,
        status: formData.status,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        features: formData.features,
        isFeatured: formData.isFeatured,
        description: formData.description.trim() || undefined,
        latitude: formData.latitude && formData.latitude.trim() ? Number(formData.latitude) : undefined,
        longitude: formData.longitude && formData.longitude.trim() ? Number(formData.longitude) : undefined,
        area: formData.area && formData.area.trim() ? Number(formData.area) : undefined,
        images: allImageUrls.map(url => ({ url, filename: url.split('/').pop()! }))
      };

      console.log('Sending property data:', propertyData);
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
      setUploadingImages(false);
      setUploadProgress(0);
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.bedrooms ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.bathrooms ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.area ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.latitude ? 'border-red-500' : 'border-gray-300'}`}
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${errors.longitude ? 'border-red-500' : 'border-gray-300'}`}
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
            <RichTextEditor
              content={formData.description}
              onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
              placeholder="Describe the property... Use the toolbar above to format text, add lists, etc."
              className="w-full"
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

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Images</h2>

          {/* Upload Progress */}
          {uploadingImages && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Uploading Images...</span>
                <span className="text-sm text-blue-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              {formData.newImages.length > 0 && (
                <p className="text-sm text-blue-700 mt-2">
                  Uploading {formData.newImages.length} image{formData.newImages.length !== 1 ? 's' : ''}...
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {formData.existingImages.map(image => (
              <div key={image.url} className="relative group">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image.url)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* New Images Preview */}
            {formData.newImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`New image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg opacity-70"
                />
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <div className="text-blue-800 text-xs font-medium bg-blue-100 px-2 py-1 rounded">
                    New
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      newImages: prev.newImages.filter((_, i) => i !== index)
                    }));
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="text-sm">Click to upload images or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB each</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  setFormData(prev => ({
                    ...prev,
                    newImages: [...prev.newImages, ...Array.from(e.target.files || [])]
                  }));
                }
              }}
            />
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
            disabled={saving || uploadingImages}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImages ? `Uploading... ${uploadProgress}%` : saving ? 'Saving...' : 'Update Property'}
          </button>
        </div>
      </form>
    </div>
  );
}
