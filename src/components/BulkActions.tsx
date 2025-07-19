"use client";

import { useState } from "react";

interface BulkActionsProps {
  selectedItems: string[];
  totalItems: number;
  onSelectAll: (selected: boolean) => void;
  onBulkAction: (action: string, items: string[]) => void;
  actions: Array<{
    id: string;
    label: string;
    icon?: string;
    color?: 'red' | 'blue' | 'green' | 'yellow';
    confirmMessage?: string;
  }>;
  loading?: boolean;
}

export default function BulkActions({
  selectedItems,
  totalItems,
  onSelectAll,
  onBulkAction,
  actions,
  loading = false
}: BulkActionsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const allSelected = selectedItems.length === totalItems && totalItems > 0;
  const someSelected = selectedItems.length > 0 && selectedItems.length < totalItems;

  const handleSelectAll = () => {
    onSelectAll(!allSelected);
  };

  const handleAction = (action: string) => {
    if (selectedItems.length === 0) return;
    
    const actionConfig = actions.find(a => a.id === action);
    if (actionConfig?.confirmMessage) {
      if (confirm(`${actionConfig.confirmMessage} (${selectedItems.length} items)`)) {
        onBulkAction(action, selectedItems);
      }
    } else {
      onBulkAction(action, selectedItems);
    }
    setIsDropdownOpen(false);
  };

  const getActionColor = (color?: string) => {
    switch (color) {
      case 'red': return 'text-red-600 hover:bg-red-50';
      case 'blue': return 'text-blue-600 hover:bg-blue-50';
      case 'green': return 'text-green-600 hover:bg-green-50';
      case 'yellow': return 'text-yellow-600 hover:bg-yellow-50';
      default: return 'text-gray-600 hover:bg-gray-50';
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={allSelected}
          ref={(input) => {
            if (input) input.indeterminate = someSelected;
          }}
          onChange={handleSelectAll}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <span className="ml-2 text-sm text-gray-700">
          {selectedItems.length > 0 
            ? `${selectedItems.length} selected` 
            : `Select all (${totalItems})`
          }
        </span>
      </div>

      {selectedItems.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Bulk Actions'}
            <svg className="ml-2 -mr-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action.id)}
                    className={`block w-full text-left px-4 py-2 text-sm ${getActionColor(action.color)}`}
                  >
                    <span className="flex items-center">
                      {action.icon && <span className="mr-2">{action.icon}</span>}
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}