"use client";

import { useState, useEffect } from "react";

interface EventPhoto {
  id: string;
  url: string;
  title: string;
  date: string;
  description: string;
  category: string;
  gallery?: string[]; // Additional photos for the event
}

interface SectionInfo {
  title: string;
  subtitle: string;
  description: string;
}

export default function MemorableMomentsAdmin() {
  const [sectionInfo, setSectionInfo] = useState<SectionInfo>({
    title: "Memorable Moments",
    subtitle: "Our Journey",
    description: "Loading..."
  });
  const [events, setEvents] = useState<EventPhoto[]>([]);
  const [editingEvent, setEditingEvent] = useState<EventPhoto | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingMultiple, setUploadingMultiple] = useState(false);

  // Load data from API on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/admin/memorable-moments');
        if (response.ok) {
          const data = await response.json();
          setSectionInfo(data.sectionInfo);
          setEvents(data.events || []);
        } else {
          console.error('Failed to load memorable moments data');
        }
      } catch (error) {
        console.error('Error loading memorable moments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSectionInfoChange = (field: keyof SectionInfo, value: string) => {
    setSectionInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleEventChange = (field: keyof EventPhoto, value: string) => {
    if (editingEvent) {
      setEditingEvent(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const saveEvent = () => {
    if (editingEvent) {
      if (isAddingNew) {
        setEvents(prev => [...prev, editingEvent]);
        setIsAddingNew(false);
      } else {
        setEvents(prev => prev.map(event =>
          event.id === editingEvent.id ? editingEvent : event
        ));
      }
      setEditingEvent(null);
    }
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const addNewEvent = () => {
    const newEvent: EventPhoto = {
      id: Date.now().toString(),
      url: "",
      title: "",
      date: "",
      description: "",
      category: "",
      gallery: []
    };
    setEditingEvent(newEvent);
    setIsAddingNew(true);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      setUploadProgress(20);

      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(50);

      const response = await fetch('/api/admin/memorable-moments/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(80);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success || !result.url) {
        throw new Error('Invalid response from server');
      }

      if (editingEvent) {
        // Store the data URL (base64) which will be saved to database
        setEditingEvent(prev => prev ? { ...prev, url: result.url } : null);
      }

      setUploadProgress(100);

      // Show success message briefly
      setTimeout(() => {
        alert('Image uploaded successfully! The image will be saved to the database when you save this event.');
      }, 500);

      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      alert(`Upload failed: ${errorMessage}`);
      return null;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 3000);
    }
  };

  const handleMultipleImageUpload = async (files: FileList) => {
    if (!editingEvent) return;

    setUploadingMultiple(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        // Update progress
        const baseProgress = (i / totalFiles) * 100;
        setUploadProgress(baseProgress);

        const response = await fetch('/api/admin/memorable-moments/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(`Failed to upload ${file.name}: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();

        if (!result.success || !result.url) {
          throw new Error(`Invalid response for ${file.name}`);
        }

        uploadedUrls.push(result.url);
      }

      // Add all uploaded URLs to the gallery
      setEditingEvent(prev => {
        if (!prev) return null;
        const existingGallery = prev.gallery || [];
        return {
          ...prev,
          gallery: [...existingGallery, ...uploadedUrls]
        };
      });

      setUploadProgress(100);
      alert(`Successfully uploaded ${uploadedUrls.length} image(s)!`);
    } catch (error) {
      console.error('Multiple upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload images';
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploadingMultiple(false);
      setTimeout(() => setUploadProgress(0), 3000);
    }
  };

  const removeGalleryImage = (index: number) => {
    if (!editingEvent) return;
    setEditingEvent(prev => {
      if (!prev || !prev.gallery) return prev;
      const newGallery = [...prev.gallery];
      newGallery.splice(index, 1);
      return {
        ...prev,
        gallery: newGallery
      };
    });
  };

  const saveToServer = async () => {
    setSaveStatus('saving');
    try {
      const payload = {
        sectionInfo,
        events
      };

      console.log('Sending data to server:', {
        sectionInfo,
        eventsCount: events.length,
        events: events.map((e, i) => ({
          index: i,
          id: e.id,
          title: e.title,
          hasUrl: !!e.url,
          hasDate: !!e.date,
          hasDescription: !!e.description,
          hasCategory: !!e.category
        }))
      });

      const response = await fetch('/api/admin/memorable-moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      setSaveStatus('saved');

      // Reload data to ensure consistency
      try {
        const reloadResponse = await fetch('/api/admin/memorable-moments');
        if (reloadResponse.ok) {
          const reloadedData = await reloadResponse.json();
          setSectionInfo(reloadedData.sectionInfo);
          setEvents(reloadedData.events || []);
          console.log('Data reloaded successfully');
        } else {
          console.warn('Failed to reload data, but save was successful');
        }
      } catch (reloadError) {
        console.warn('Failed to reload data:', reloadError);
      }

      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to save data to server';
      alert(`Save failed: ${errorMessage}`);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const generateJSON = () => {
    const data = {
      sectionInfo,
      events
    };
    return JSON.stringify(data, null, 2);
  };

  const downloadJSON = () => {
    const dataStr = generateJSON();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'memorableMoments.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Memorable Moments Admin</h1>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-600">Loading memorable moments data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Memorable Moments Admin</h1>

          {/* Section Info Editor */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Section Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={sectionInfo.title}
                  onChange={(e) => handleSectionInfoChange('title', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={sectionInfo.subtitle}
                  onChange={(e) => handleSectionInfoChange('subtitle', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={sectionInfo.description}
                  onChange={(e) => handleSectionInfoChange('description', e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Events</h2>
              <button
                onClick={addNewEvent}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Add New Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="aspect-video bg-gray-200 rounded-md mb-3 overflow-hidden relative">
                    {event.url && (
                      <img
                        src={event.url.startsWith('/images/') ? `${event.url}?t=${Date.now()}` : event.url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-sm">Image not found</div>';
                        }}
                      />
                    )}
                    {/* Gallery indicator badge */}
                    {event.gallery && event.gallery.length > 0 && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        {event.gallery.length} more
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{event.category} • {event.date}</p>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save & Export Section */}
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Save & Export Data</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={saveToServer}
                disabled={saveStatus === 'saving'}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  saveStatus === 'saving'
                    ? 'bg-blue-400 text-white cursor-not-allowed'
                    : saveStatus === 'saved'
                    ? 'bg-green-600 text-white'
                    : saveStatus === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved!' : saveStatus === 'error' ? '✗ Error' : 'Save to Server'}
              </button>

              <button
                onClick={downloadJSON}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Download JSON (Backup)
              </button>

              <div className="text-sm text-gray-600">
                <p><strong>Recommended:</strong> Use "Save to Server" to automatically update the website.</p>
                <p>Use "Download JSON" as a backup option only.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {isAddingNew ? 'Add New Event' : 'Edit Event'}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editingEvent.title}
                      onChange={(e) => handleEventChange('title', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <input
                        type="text"
                        value={editingEvent.category}
                        onChange={(e) => handleEventChange('category', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="text"
                        value={editingEvent.date}
                        onChange={(e) => handleEventChange('date', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Image</label>

                    {/* File Upload Section */}
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file);
                            }
                          }}
                          className="hidden"
                          id="image-upload"
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="image-upload"
                          className={`cursor-pointer inline-flex flex-col items-center ${
                            isUploading ? 'cursor-not-allowed opacity-50' : ''
                          }`}
                        >
                          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            {isUploading ? 'Uploading...' : 'Click to upload image'}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            JPEG, PNG, WebP up to 5MB
                          </span>
                        </label>

                        {/* Upload Progress */}
                        {uploadProgress > 0 && (
                          <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* OR Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">or enter URL manually</span>
                        </div>
                      </div>

                      {/* Manual URL Input */}
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={editingEvent.url}
                        onChange={(e) => handleEventChange('url', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />

                      {/* Image Preview */}
                      {editingEvent.url && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={editingEvent.url.startsWith('/images/') ? `${editingEvent.url}?t=${Date.now()}` : editingEvent.url}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext y="50" x="50" font-size="12" text-anchor="middle" dy=".3em" fill="%23999"%3EImage not found%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editingEvent.description}
                      onChange={(e) => handleEventChange('description', e.target.value)}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Multiple Photos Gallery Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Photos (Gallery)
                    </label>

                    {/* Multiple File Upload */}
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-blue-50">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            handleMultipleImageUpload(files);
                          }
                        }}
                        className="hidden"
                        id="multiple-image-upload"
                        disabled={uploadingMultiple}
                      />
                      <label
                        htmlFor="multiple-image-upload"
                        className={`cursor-pointer inline-flex flex-col items-center ${
                          uploadingMultiple ? 'cursor-not-allowed opacity-50' : ''
                        }`}
                      >
                        <svg className="w-10 h-10 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-base font-medium text-blue-700 mb-1">
                          {uploadingMultiple ? 'Uploading photos...' : 'Upload Multiple Photos'}
                        </span>
                        <span className="text-sm text-blue-600">
                          Click to select multiple images
                        </span>
                        <span className="text-xs text-gray-600 mt-2">
                          JPEG, PNG, WebP • Up to 5MB each • Select multiple files
                        </span>
                      </label>

                      {/* Upload Progress for Multiple Files */}
                      {uploadingMultiple && uploadProgress > 0 && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-blue-600 h-3 rounded-full transition-all duration-300 flex items-center justify-center text-xs text-white font-medium"
                              style={{ width: `${uploadProgress}%` }}
                            >
                              {uploadProgress > 10 && `${Math.round(uploadProgress)}%`}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Gallery Preview */}
                    {editingEvent.gallery && editingEvent.gallery.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Gallery ({editingEvent.gallery.length} photo{editingEvent.gallery.length !== 1 ? 's' : ''})
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {editingEvent.gallery.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                <img
                                  src={imageUrl.startsWith('/images/') ? `${imageUrl}?t=${Date.now()}` : imageUrl}
                                  alt={`Gallery ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext y="50" x="50" font-size="10" text-anchor="middle" dy=".3em" fill="%23999"%3EError%3C/text%3E%3C/svg%3E';
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                title="Remove image"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 text-center">
                                Photo {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setEditingEvent(null);
                      setIsAddingNew(false);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEvent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}