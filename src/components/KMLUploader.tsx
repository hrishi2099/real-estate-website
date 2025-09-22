"use client";

import { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface KMLUploaderProps {
  onKMLUploaded: (kmlUrl: string, kmlContent: string) => void;
  currentKMLUrl?: string;
  className?: string;
}

export default function KMLUploader({
  onKMLUploaded,
  currentKMLUrl,
  className = ""
}: KMLUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.kml')) {
      setUploadStatus('error');
      setStatusMessage('Please select a valid KML file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('error');
      setStatusMessage('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      // Read file content
      const fileContent = await file.text();

      // Validate KML content
      if (!fileContent.includes('<kml') && !fileContent.includes('<?xml')) {
        throw new Error('Invalid KML file format');
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append('kmlFile', file);

      // Upload file
      const response = await fetch('/api/upload/kml', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();

      setUploadStatus('success');
      setStatusMessage('KML file uploaded successfully');
      setPreviewContent(fileContent.substring(0, 500) + '...');

      // Call the callback with the uploaded file URL and content
      onKMLUploaded(result.url, fileContent);

    } catch (error) {
      console.error('Error uploading KML file:', error);
      setUploadStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to upload KML file');
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setPreviewContent(null);
    setUploadStatus('idle');
    setStatusMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          KML File (Plot Boundaries)
        </label>
        {currentKMLUrl && (
          <a
            href={currentKMLUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View Current KML
          </a>
        )}
      </div>

      {/* Upload Area */}
      <div
        onClick={!isUploading ? openFileDialog : undefined}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isUploading ? 'border-gray-300 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
          ${uploadStatus === 'success' ? 'border-green-300 bg-green-50' : ''}
          ${uploadStatus === 'error' ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".kml"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Uploading KML file...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                KML files only, up to 10MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-sm text-green-800">{statusMessage}</p>
          <button
            onClick={clearFile}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-sm text-red-800">{statusMessage}</p>
          <button
            onClick={clearFile}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KML Preview */}
      {previewContent && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            KML Content Preview
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <File className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">KML File Content</span>
            </div>
            <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
              {previewContent}
            </pre>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>About KML Files:</strong> KML (Keyhole Markup Language) files contain geographic data
          including plot boundaries, points of interest, and 3D models. Upload your property's KML file
          to display detailed plot information on Google Earth view.
        </p>
      </div>
    </div>
  );
}