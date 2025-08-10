import React, { useState, useRef } from 'react';
import { fileUploadApi, FileUploadResponse } from '../services/fileUploadApi';

interface FileUploadProps {
  onUploadSuccess?: (response: FileUploadResponse) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  accept = "*/*",
  maxSize = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      const error = `File size exceeds ${maxSize}MB limit`;
      onUploadError?.(error);
      return;
    }

    setUploading(true);

    try {
      const response = await fileUploadApi.uploadFile(file);
      onUploadSuccess?.(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      <div
        className={`file-upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: dragOver ? '#f0f0f0' : '#fafafa',
          transition: 'background-color 0.2s ease'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div>
            <div className="spinner" style={{ margin: '0 auto 10px' }}>
              Uploading...
            </div>
            <p>Please wait while your file is being uploaded...</p>
          </div>
        ) : (
          <div>
            <p><strong>Click to select a file or drag and drop here</strong></p>
            <p>Maximum file size: {maxSize}MB</p>
          </div>
        )}
      </div>
    </div>
  );
};