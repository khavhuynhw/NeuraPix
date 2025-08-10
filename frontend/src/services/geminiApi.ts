import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace('/v1', '') || 'http://localhost:8080/api';

// Gemini chat request interface
interface GeminiChatRequest {
  message: string;
  images?: string[]; // Base64 encoded images
  conversationId?: string;
  userId?: string;
  streamResponse?: boolean;
  
  // Image generation specific fields
  style?: string;
  aspectRatio?: string;
  width?: number;
  height?: number;
  quality?: string;
}

// Gemini chat response interface
interface GeminiChatResponse {
  messageId?: string;
  conversationId?: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'ERROR' | 'ENHANCED_PROMPT';
  generatedImages?: string[];
  timestamp: string;
  isComplete: boolean;
  errorMessage?: string;
  tokensUsed?: number;
}

// Export types explicitly
export type { GeminiChatRequest, GeminiChatResponse };

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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

export const geminiApi = {
  // Send text message to Gemini
  sendMessage: async (request: GeminiChatRequest): Promise<GeminiChatResponse> => {
    try {
      const response = await apiClient.post('/chat/message', request);
      return response.data;
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  },

  // Generate image directly (Hybrid: Gemini + DALL-E)
  generateImage: async (request: GeminiChatRequest): Promise<GeminiChatResponse> => {
    try {
      const response = await apiClient.post('/chat/generate-image', request);
      return response.data;
    } catch (error: any) {
      console.error('Error generating image:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate image');
    }
  },

  // Analyze uploaded images
  analyzeImage: async (request: GeminiChatRequest): Promise<GeminiChatResponse> => {
    try {
      const response = await apiClient.post('/chat/analyze-image', request);
      return response.data;
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      throw new Error(error.response?.data?.message || 'Failed to analyze image');
    }
  },

  // Process multimodal input (text + images)
  processMultiModal: async (request: GeminiChatRequest): Promise<GeminiChatResponse> => {
    try {
      const response = await apiClient.post('/chat/multimodal', request);
      return response.data;
    } catch (error: any) {
      console.error('Error processing multimodal input:', error);
      throw new Error(error.response?.data?.message || 'Failed to process multimodal input');
    }
  },
};

// Utility functions for image handling
export const imageUtils = {
  // Convert File to base64
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  },

  // Validate image file
  validateImageFile: (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Unsupported image format. Please use JPG, PNG, or WebP.');
    }

    if (file.size > maxSize) {
      throw new Error('Image size too large. Please use images smaller than 10MB.');
    }

    return true;
  },

  // Compress image if needed (optional enhancement)
  compressImage: async (file: File, maxWidth: number = 1024): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  },
};