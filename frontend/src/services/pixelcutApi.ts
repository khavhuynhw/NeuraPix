import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = `${BASE_URL}/api`;

// PixelCut API request interface
interface PixelCutRequest {
  prompt?: string;
  imageUrl?: string;
  negativePrompt?: string;
  model?: string;
  style?: string;
  width?: number;
  height?: number;
  steps?: number;
  scale?: number;
  seed?: number;
  numImages?: number;
  quality?: string;
  format?: string;
}

// PixelCut API response interface
interface PixelCutResponse {
  success: boolean;
  imageUrls?: string[];
  taskId?: string;
  status?: string;
  errorMessage?: string;
  timestamp?: string;
}

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for image processing
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const pixelcutApi = {
  // Generate image from prompt
  generateImage: async (request: PixelCutRequest): Promise<PixelCutResponse> => {
    try {
      const response = await apiClient.post('/pixelcut/generate-image', request);
      return response.data;
    } catch (error: any) {
      console.error('Error generating image:', error);
      throw new Error(error.response?.data?.errorMessage || 'Failed to generate image');
    }
  },

  // Remove background from image
  removeBackground: async (imageUrl: string): Promise<PixelCutResponse> => {
    try {
      const request: PixelCutRequest = { imageUrl };
      const response = await apiClient.post('/pixelcut/remove-background', request);
      return response.data;
    } catch (error: any) {
      console.error('Error removing background:', error);
      throw new Error(error.response?.data?.errorMessage || 'Failed to remove background');
    }
  },

  // Generate background for image
  generateBackground: async (imageUrl: string, prompt: string, style?: string): Promise<PixelCutResponse> => {
    try {
      const request: PixelCutRequest = { 
        imageUrl, 
        prompt, 
        style: style || 'realistic',
        quality: 'high'
      };
      const response = await apiClient.post('/pixelcut/generate-background', request);
      return response.data;
    } catch (error: any) {
      console.error('Error generating background:', error);
      throw new Error(error.response?.data?.errorMessage || 'Failed to generate background');
    }
  },

  // Upscale image
  upscaleImage: async (imageUrl: string, scale?: number): Promise<PixelCutResponse> => {
    try {
      const request: PixelCutRequest = { 
        imageUrl, 
        scale: scale || 2.0,
        quality: 'high'
      };
      const response = await apiClient.post('/pixelcut/upscale', request);
      return response.data;
    } catch (error: any) {
      console.error('Error upscaling image:', error);
      throw new Error(error.response?.data?.errorMessage || 'Failed to upscale image');
    }
  },

  // Get available models
  getModels: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get('/pixelcut/models');
      return response.data;
    } catch (error: any) {
      console.error('Error getting models:', error);
      return ['stable-diffusion', 'dall-e', 'midjourney'];
    }
  },

  // Get available styles
  getStyles: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get('/pixelcut/styles');
      return response.data;
    } catch (error: any) {
      console.error('Error getting styles:', error);
      return ['realistic', 'artistic', 'cartoon', 'anime', 'photographic'];
    }
  },
};

// Export types for use in components
export type { PixelCutRequest, PixelCutResponse };

// Utility functions for image handling
export const pixelcutUtils = {
  // Check if URL is a valid image
  isValidImageUrl: (url: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext)) || url.startsWith('data:image/');
  },

  // Convert blob to data URL
  blobToDataUrl: (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  // Download image from URL
  downloadImage: (url: string, filename: string = 'image'): void => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Estimate processing time based on operation
  getEstimatedProcessingTime: (operation: 'generate' | 'removeBackground' | 'generateBackground' | 'upscale'): number => {
    const times = {
      generate: 30000, // 30 seconds
      removeBackground: 15000, // 15 seconds
      generateBackground: 25000, // 25 seconds
      upscale: 20000, // 20 seconds
    };
    return times[operation];
  },
};