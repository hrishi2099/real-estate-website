// src/components/LeadUploadForm.tsx
'use client';

import React, { useState } from 'react';

const LeadUploadForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setMessage('');
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile) {
      setMessage('Please select an Excel file to upload.');
      return;
    }

    setIsUploading(true);
    setMessage('Uploading file...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/admin/leads/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Upload successful! ${result.message}`);
        setSelectedFile(null); // Clear selected file
      } else {
        setMessage(`Upload failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      setMessage('An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Upload Leads via Excel</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="excelFile" className="block text-sm font-medium text-gray-700 mb-1">
            Select Excel File (.xlsx, .xls)
          </label>
          <input
            type="file"
            id="excelFile"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={isUploading}
          />
        </div>
        {selectedFile && (
          <p className="text-sm text-gray-600">Selected file: {selectedFile.name}</p>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md
            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Leads'}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LeadUploadForm;