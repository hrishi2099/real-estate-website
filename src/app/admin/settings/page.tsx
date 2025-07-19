"use client";

import { useState, useEffect } from "react";

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
    sundayHours: ""
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
          sundayHours: data.sundayHours || ""
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
          sundayHours: updatedSettings.sundayHours || ""
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
        setMessage(`Error updating settings: ${errorData.details || errorData.error}`);
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Office Settings</h1>
        <p className="text-gray-600">Manage your office information and branding</p>
        
        {/* Debug info */}
        <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
          <strong>Debug Info:</strong>
          <br />Settings ID: {settings?.id || 'No settings'}
          <br />Form Address: &quot;{formData.address}&quot;
          <br />Settings Address: &quot;{settings?.address}&quot;
          <br />
          <button 
            onClick={() => fetchSettings()} 
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs"
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter company name"
                key={`companyName-${settings?.id || 'new'}`}
              />
              <small className="text-gray-500">Current: {formData.companyName || 'Not set'}</small>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter office address"
              key={`address-${settings?.id || 'new'}`}
            />
            <small className="text-gray-500">Current: {formData.address || 'Not set'}</small>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            <div className="space-y-4">
              {formData.logoUrl && (
                <div className="flex items-center space-x-4">
                  <img
                    src={formData.logoUrl}
                    alt="Current logo"
                    className="h-16 w-auto object-contain border border-gray-200 rounded"
                    key={`logo-${formData.logoUrl}`}
                  />
                  <span className="text-sm text-gray-600">Current logo</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500">
                Upload a new logo (PNG, JPG, or SVG recommended)
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Office Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={formData[key as keyof typeof formData]}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 9:00 AM - 6:00 PM or Closed"
                  />
                </div>
              ))}
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-md ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}