import React, { useState } from 'react';

const LocalFilePreview = ({ files, onRemoveFile }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getFileType = (file) => {
    const type = file.type;
    
    if (type.startsWith('image/')) {
      return 'image';
    } else if (type === 'application/pdf') {
      return 'pdf';
    } else if (type.startsWith('video/')) {
      return 'video';
    } else if (type.startsWith('audio/')) {
      return 'audio';
    } else if (type.includes('document') || type.includes('msword') || type.includes('wordprocessingml')) {
      return 'document';
    }
    return 'unknown';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'document':
        return (
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const createPreviewUrl = (file) => {
    return URL.createObjectURL(file);
  };

  const openPreview = (file) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const closePreview = () => {
    setSelectedFile(null);
    setIsModalOpen(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderPreview = (file) => {
    const fileType = getFileType(file);
    const previewUrl = createPreviewUrl(file);
    
    switch (fileType) {
      case 'image':
        return (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        );
      case 'pdf':
        return (
          <iframe
            src={previewUrl}
            className="w-full h-[80vh] rounded-lg"
            title="PDF Preview"
          />
        );
      case 'video':
        return (
          <video
            controls
            className="max-w-full max-h-[80vh] rounded-lg"
            src={previewUrl}
          >
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center p-8">
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              {getFileIcon('audio')}
            </div>
            <audio controls className="w-full max-w-md">
              <source src={previewUrl} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center p-8">
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              {getFileIcon(fileType)}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Preview not available for this file type
            </p>
            <p className="text-sm text-gray-500">
              {file.name} ({formatFileSize(file.size)})
            </p>
          </div>
        );
    }
  };

  if (!files || files.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file, index) => {
          const fileType = getFileType(file);
          const previewUrl = fileType === 'image' ? createPreviewUrl(file) : null;
          
          return (
            <div 
              key={index} 
              className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-3 group"
            >
              {/* Remove button */}
              {onRemoveFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(index);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  ×
                </button>
              )}
              
              <div 
                className="cursor-pointer"
                onClick={() => openPreview(file)}
              >
                {fileType === 'image' && previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center mb-2">
                    {getFileIcon(fileType)}
                  </div>
                )}
                
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {isModalOpen && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-full overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedFile.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                onClick={closePreview}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4 flex justify-center">
              {renderPreview(selectedFile)}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LocalFilePreview;