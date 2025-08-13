"use client";

import { useState } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport?: (format: string) => void;
  title?: string;
  type?: string;
  filters?: any;
}

export default function ExportModal({ 
  isOpen, 
  onClose, 
  onExport,
  title = "Export Data",
  type,
  filters
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState('csv');

  if (!isOpen) return null;

  const handleExport = async () => {
    if (onExport) {
      onExport(selectedFormat);
      onClose();
      return;
    }
    
    if (type) {
      try {
        const response = await fetch(`/api/export/${type}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ format: selectedFormat, filters }),
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `${type}-export.${selectedFormat}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Export error:', error);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 px-4">
      <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md sm:max-w-lg shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 touch-manipulation"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select export format:
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={selectedFormat === 'csv'}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-900">CSV (.csv)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={selectedFormat === 'json'}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-900">JSON (.json)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={selectedFormat === 'excel'}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-900">Excel (.xlsx)</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 touch-manipulation"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 touch-manipulation"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}