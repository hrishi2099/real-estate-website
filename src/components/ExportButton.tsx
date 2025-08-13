"use client";

interface ExportButtonProps {
  onClick?: () => void;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
  data?: any[];
  type?: string;
  filters?: any;
}

export default function ExportButton({ 
  onClick,
  loading = false, 
  className = "",
  children = "Export",
  data,
  type,
  filters
}: ExportButtonProps) {
  
  const handleExport = async () => {
    if (onClick) {
      onClick();
      return;
    }
    
    if (data && type) {
      try {
        const response = await fetch(`/api/export/${type}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data, filters }),
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `${type}-export.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('Export error:', error);
      }
    }
  };
  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {children}
        </>
      )}
    </button>
  );
}