const API_BASE_URL = 'http://localhost:8080/api';

export interface FileUploadResponse {
  success: boolean;
  fileName: string;
  originalName: string;
  size: number;
  contentType: string;
  error?: string;
}

export const fileUploadApi = {
  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  },

  downloadFile: async (fileName: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/files/download/${fileName}`);
    
    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  },

  deleteFile: async (fileName: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/files/${fileName}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return response.json();
  },
};