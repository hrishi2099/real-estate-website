"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import dynamic from 'next/dynamic';
import { getFeaturesByPropertyType, getPropertyTypeLabel } from "@/lib/propertyFeatures";
import KMLUploader from "@/components/KMLUploader";
import { FEATURE_FLAGS } from "@/lib/features";
import Image from "next/image";

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="border border-gray-300 rounded-lg p-3 h-32 bg-gray-50 animate-pulse">Loading editor...</div>
});

interface ValidationError {
  path: (string | number)[];
  message: string;
}

interface UploadedFile {
  url: string;
  filename?: string;
}

export default function NewProperty() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug: Log feature flags
  console.log('🚀 Feature Flags in Admin:', FEATURE_FLAGS);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    pricePerSqft: '',
    location: '',
    latitude: '',
    longitude: '',
    type: 'AGRICULTURAL_LAND',
    area: '',
    features: [] as string[],
    images: [] as File[],
    kmlFileUrl: '' as string,
    kmlContent: '' as string
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const propertyTypes = [
    { value: 'AGRICULTURAL_LAND', label: getPropertyTypeLabel('AGRICULTURAL_LAND') },
    { value: 'NA_LAND', label: getPropertyTypeLabel('NA_LAND') }
  ];

  const availableFeatures = getFeaturesByPropertyType(formData.type);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear features when property type changes
      ...(name === 'type' ? { features: [] } : {})
    }));
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
    
    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a valid number greater than 0';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    // Optional but validated fields
    if (formData.area && formData.area.trim()) {
      if (isNaN(Number(formData.area)) || Number(formData.area) <= 0) {
        newErrors.area = 'Area must be a valid number greater than 0';
      }
    }

    if (formData.pricePerSqft && formData.pricePerSqft.trim()) {
      if (isNaN(Number(formData.pricePerSqft)) || Number(formData.pricePerSqft) <= 0) {
        newErrors.pricePerSqft = 'Price per sqft must be a valid number greater than 0';
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
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let imageUrls: string[] = [];
      console.log('Starting property creation with images:', formData.images.length);
      
      if (formData.images.length > 0) {
        const imageFormData = new FormData();
        formData.images.forEach(image => {
          console.log('Adding image to upload:', image.name);
          imageFormData.append('files', image);
        });

        console.log('Uploading images...');
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Upload failed:', errorText);
          throw new Error(`Image upload failed: ${errorText}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log('Upload result:', uploadResult);
        imageUrls = uploadResult.files.map((file: UploadedFile) => file.url);
        console.log('Image URLs:', imageUrls);
      }

      const propertyData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        price: Number(formData.price),
        pricePerSqft: formData.pricePerSqft && formData.pricePerSqft.trim() ? Number(formData.pricePerSqft) : undefined,
        location: formData.location.trim(),
        latitude: formData.latitude && formData.latitude.trim() ? Number(formData.latitude) : undefined,
        longitude: formData.longitude && formData.longitude.trim() ? Number(formData.longitude) : undefined,
        type: formData.type as 'AGRICULTURAL_LAND' | 'NA_LAND',
        area: formData.area && formData.area.trim() ? Number(formData.area) : undefined,
        features: formData.features,
        status: 'ACTIVE' as 'ACTIVE' | 'SOLD' | 'PENDING' | 'INACTIVE',
        isFeatured: false,
        images: imageUrls.map(url => ({ url, filename: url.split('/').pop()!, isPrimary: imageUrls.indexOf(url) === 0 })),
        kmlFileUrl: formData.kmlFileUrl && formData.kmlFileUrl.trim() ? formData.kmlFileUrl.trim() : undefined
      };

      console.log('Creating property with data:', propertyData);
      const response = await api.createProperty(propertyData);
      if (response?.data) {
        alert('Property created successfully!');
        router.push('/admin/properties');
      } else {
        const errorMessage = response?.error || 'Failed to create property. Please check all fields and try again.';
        alert(errorMessage);
      }
    } catch (error: unknown) {
      console.error('Error creating property:', error);
      
      // Check if it's a validation error
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const responseError = error as { response: { data: { details?: ValidationError[], error?: string } } };
        if (responseError.response.data.details) {
          const validationErrors = responseError.response.data.details;
          const errorMessages = validationErrors.map((err: ValidationError) => `${err.path?.join('.')}: ${err.message}`);
          alert(`Validation Error:\n${errorMessages.join('\n')}`);
        } else if (responseError.response.data.error) {
          alert(`Error: ${responseError.response.data.error}`);
        }
      } else if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to create property. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
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
                Price per Sqft
              </label>
              <input
                type="text"
                name="pricePerSqft"
                value={formData.pricePerSqft}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent ${
                  errors.pricePerSqft ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="₹4,500"
              />
              {errors.pricePerSqft && <p className="text-red-500 text-sm mt-1">{errors.pricePerSqft}</p>}
              <p className="text-xs text-gray-500 mt-1">Optional: Override calculated price per sqft</p>
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
            <RichTextEditor
              content={formData.description}
              onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
              placeholder="Describe the property... Use the toolbar above to format text, add lists, etc."
              className="w-full"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Features for {getPropertyTypeLabel(formData.type)}
          </h2>

          {availableFeatures.length > 0 ? (
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
          ) : (
            <p className="text-gray-500 text-sm">Select a property type to see available features</p>
          )}

          {formData.features.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Selected Features:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.features.map(feature => (
                  <span
                    key={feature}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleFeatureToggle(feature)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Images</h2>
          
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
                    images: Array.from(e.target.files || [])
                  }));
                }
              }}
            />
          </div>
          
          {/* Image Preview */}
          {formData.images.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Images:</h3>
              <div className="grid grid-cols-4 gap-2">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="relative w-full h-16">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded border"
                        unoptimized
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1 truncate">{file.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KML File Upload - Only show if feature is enabled */}
        {FEATURE_FLAGS.KML_UPLOAD_ENABLED && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Plot Boundaries (KML File)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload a KML file to show detailed plot boundaries and property information in Google Earth view.
            </p>
            <KMLUploader
              onKMLUploaded={(url, content) => {
                setFormData(prev => ({ ...prev, kmlFileUrl: url, kmlContent: content }));
              }}
              currentKMLUrl={formData.kmlFileUrl || undefined}
            />
            {formData.kmlFileUrl && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800 font-medium">✓ KML file uploaded successfully</p>
                <p className="text-xs text-green-600 mt-1">File: {formData.kmlFileUrl.split('/').pop()}</p>
              </div>
            )}
          </div>
        )}

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
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
}