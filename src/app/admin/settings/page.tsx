"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface OfficeSettings {
  id: string;
  companyName: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  mondayHours: string | null;
  tuesdayHours: string | null;
  wednesdayHours: string | null;
  thursdayHours: string | null;
  fridayHours: string | null;
  saturdayHours: string | null;
  sundayHours: string | null;
  // Google Tag Manager Integration
  gtmContainerId: string | null;
  gtmEnabled: boolean | null;
  // Google Analytics 4
  ga4MeasurementId: string | null;
  ga4Enabled: boolean | null;
  // Facebook Pixel
  facebookPixelId: string | null;
  facebookPixelEnabled: boolean | null;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<OfficeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    mondayHours: "",
    tuesdayHours: "",
    wednesdayHours: "",
    thursdayHours: "",
    fridayHours: "",
    saturdayHours: "",
    sundayHours: "",
    // Google Tag Manager
    gtmContainerId: "",
    gtmEnabled: false,
    // Google Analytics 4
    ga4MeasurementId: "",
    ga4Enabled: false,
    // Facebook Pixel
    facebookPixelId: "",
    facebookPixelEnabled: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      console.log("Fetching settings...");
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched settings data:", data);
        
        const newFormData = {
          companyName: data.companyName || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          website: data.website || "",
          logoUrl: data.logoUrl || "",
          mondayHours: data.mondayHours || "",
          tuesdayHours: data.tuesdayHours || "",
          wednesdayHours: data.wednesdayHours || "",
          thursdayHours: data.thursdayHours || "",
          fridayHours: data.fridayHours || "",
          saturdayHours: data.saturdayHours || "",
          sundayHours: data.sundayHours || "",
          // Google Tag Manager
          gtmContainerId: data.gtmContainerId || "",
          gtmEnabled: data.gtmEnabled || false,
          // Google Analytics 4
          ga4MeasurementId: data.ga4MeasurementId || "",
          ga4Enabled: data.ga4Enabled || false,
          // Facebook Pixel
          facebookPixelId: data.facebookPixelId || "",
          facebookPixelEnabled: data.facebookPixelEnabled || false
        };
        
        console.log("Setting form data from fetch:", newFormData);
        
        setSettings(data);
        setFormData(newFormData);
      } else {
        console.error("Failed to fetch settings:", response.status);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Upload response:", data);
        if (data.files && data.files.length > 0) {
          return data.files[0].url;
        }
      } else {
        const errorData = await response.json();
        console.error("Upload failed:", errorData);
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      let logoUrl = formData.logoUrl;
      
      if (logoFile) {
        console.log("Uploading logo file:", logoFile.name);
        const uploadedUrl = await handleLogoUpload(logoFile);
        console.log("Uploaded URL:", uploadedUrl);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
          console.log("Setting logoUrl to:", logoUrl);
        } else {
          console.error("Failed to upload logo");
          setMessage("Failed to upload logo. Please try again.");
          setSaving(false);
          return;
        }
      }

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          logoUrl
        })
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        console.log("Updated settings from server:", updatedSettings);
        
        const newFormData = {
          companyName: updatedSettings.companyName || "",
          address: updatedSettings.address || "",
          phone: updatedSettings.phone || "",
          email: updatedSettings.email || "",
          website: updatedSettings.website || "",
          logoUrl: updatedSettings.logoUrl || "",
          mondayHours: updatedSettings.mondayHours || "",
          tuesdayHours: updatedSettings.tuesdayHours || "",
          wednesdayHours: updatedSettings.wednesdayHours || "",
          thursdayHours: updatedSettings.thursdayHours || "",
          fridayHours: updatedSettings.fridayHours || "",
          saturdayHours: updatedSettings.saturdayHours || "",
          sundayHours: updatedSettings.sundayHours || "",
          // Google Tag Manager
          gtmContainerId: updatedSettings.gtmContainerId || "",
          gtmEnabled: updatedSettings.gtmEnabled || false,
          // Google Analytics 4
          ga4MeasurementId: updatedSettings.ga4MeasurementId || "",
          ga4Enabled: updatedSettings.ga4Enabled || false,
          // Facebook Pixel
          facebookPixelId: updatedSettings.facebookPixelId || "",
          facebookPixelEnabled: updatedSettings.facebookPixelEnabled || false
        };
        
        console.log("Setting new form data:", newFormData);
        
        setSettings(updatedSettings);
        
        // Force state update by using a callback
        setFormData(prevFormData => {
          console.log("Previous form data:", prevFormData);
          console.log("New form data being set:", newFormData);
          return newFormData;
        });
        
        setMessage("Settings updated successfully!");
        setLogoFile(null);
        
        // Force a re-fetch to ensure we have the latest data
        setTimeout(() => {
          console.log("Re-fetching settings...");
          fetchSettings();
        }, 1000);
      } else {
        const errorData = await response.json();
        let errorMessage = "Unknown error";
        if (errorData && typeof errorData === 'object') {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (Array.isArray(errorData.details)) { // If details is an array of objects
            errorMessage = errorData.details.map((detail: any) => detail.message || JSON.stringify(detail)).join(', ');
          } else {
            errorMessage = JSON.stringify(errorData); // Fallback to stringifying the whole object
          }
        }
        setMessage(`Error updating settings: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Error updating settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Office Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your office information and branding</p>
        
        {/* Debug info - Hidden on mobile for cleaner view */}
        <div className="mt-4 p-3 sm:p-4 bg-gray-100 rounded text-xs sm:text-sm hidden md:block">
          <strong>Debug Info:</strong>
          <br />Settings ID: {settings?.id || 'No settings'}
          <br />Form Address: &quot;{formData.address}&quot;
          <br />Settings Address: &quot;{settings?.address}&quot;
          <br />
          <button 
            onClick={() => fetchSettings()} 
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs touch-manipulation"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="Enter company name"
                key={`companyName-${settings?.id || 'new'}`}
              />
              <small className="text-xs sm:text-sm text-gray-500">Current: {formData.companyName || 'Not set'}</small>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Office Address
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Enter office address"
              key={`address-${settings?.id || 'new'}`}
            />
            <small className="text-xs sm:text-sm text-gray-500">Current: {formData.address || 'Not set'}</small>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            <div className="space-y-3 sm:space-y-4">
              {formData.logoUrl && (
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Image
                    src={formData.logoUrl}
                    alt="Current logo"
                    width={100}
                    height={100}
                    className="h-12 sm:h-16 w-auto object-contain border border-gray-200 rounded"
                    key={`logo-${formData.logoUrl}`}
                  />
                  <span className="text-xs sm:text-sm text-gray-600">Current logo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-3 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs sm:text-sm text-gray-500">
                Upload a new logo (PNG, JPG, or SVG recommended)
              </p>
            </div>
          </div>

          {/* Analytics & Tracking Section */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Analytics & Tracking</h3>
            
            {/* Google Tag Manager */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <input
                  type="checkbox"
                  id="gtmEnabled"
                  name="gtmEnabled"
                  checked={formData.gtmEnabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="gtmEnabled" className="ml-2 block text-sm font-medium text-gray-900">
                  Enable Google Tag Manager
                </label>
              </div>
              
              <div className={`${formData.gtmEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
                <label htmlFor="gtmContainerId" className="block text-sm font-medium text-gray-700 mb-2">
                  GTM Container ID
                </label>
                <input
                  type="text"
                  id="gtmContainerId"
                  name="gtmContainerId"
                  value={formData.gtmContainerId}
                  onChange={handleInputChange}
                  placeholder="GTM-XXXXXXX"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find your Container ID in Google Tag Manager (format: GTM-XXXXXXX)
                </p>
              </div>
            </div>

            {/* Google Analytics 4 */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <input
                  type="checkbox"
                  id="ga4Enabled"
                  name="ga4Enabled"
                  checked={formData.ga4Enabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="ga4Enabled" className="ml-2 block text-sm font-medium text-gray-900">
                  Enable Google Analytics 4 (Direct)
                </label>
              </div>
              
              <div className={`${formData.ga4Enabled ? '' : 'opacity-50 pointer-events-none'}`}>
                <label htmlFor="ga4MeasurementId" className="block text-sm font-medium text-gray-700 mb-2">
                  GA4 Measurement ID
                </label>
                <input
                  type="text"
                  id="ga4MeasurementId"
                  name="ga4MeasurementId"
                  value={formData.ga4MeasurementId}
                  onChange={handleInputChange}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find your Measurement ID in Google Analytics (format: G-XXXXXXXXXX)
                </p>
              </div>
            </div>

            {/* Facebook Pixel */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <input
                  type="checkbox"
                  id="facebookPixelEnabled"
                  name="facebookPixelEnabled"
                  checked={formData.facebookPixelEnabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="facebookPixelEnabled" className="ml-2 block text-sm font-medium text-gray-900">
                  Enable Facebook Pixel
                </label>
              </div>
              
              <div className={`${formData.facebookPixelEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
                <label htmlFor="facebookPixelId" className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook Pixel ID
                </label>
                <input
                  type="text"
                  id="facebookPixelId"
                  name="facebookPixelId"
                  value={formData.facebookPixelId}
                  onChange={handleInputChange}
                  placeholder="123456789012345"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find your Pixel ID in Facebook Business Manager
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2 sm:ml-3">
                  <h4 className="text-xs sm:text-sm font-medium text-blue-800">Analytics Integration Tips</h4>
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
                      <li>Use Google Tag Manager for centralized tracking management</li>
                      <li>GA4 Direct is useful if you only need Google Analytics without other tags</li>
                      <li>Facebook Pixel helps track conversions for Facebook/Instagram ads</li>
                      <li>Changes take effect immediately after saving</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Office Hours</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { day: 'Monday', key: 'mondayHours' },
                { day: 'Tuesday', key: 'tuesdayHours' },
                { day: 'Wednesday', key: 'wednesdayHours' },
                { day: 'Thursday', key: 'thursdayHours' },
                { day: 'Friday', key: 'fridayHours' },
                { day: 'Saturday', key: 'saturdayHours' },
                { day: 'Sunday', key: 'sundayHours' }
              ].map(({ day, key }) => (
                <div key={key}>
                  <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1">
                    {day}
                  </label>
                  <input
                    type="text"
                    id={key}
                    name={key}
                    value={String(formData[key as keyof typeof formData])}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="e.g., 9:00 AM - 6:00 PM or Closed"
                  />
                </div>
              ))}
            </div>
          </div>

          {message && (
            <div className={`p-3 sm:p-4 rounded-md ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              <p className="text-sm sm:text-base">{message}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium touch-manipulation"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}