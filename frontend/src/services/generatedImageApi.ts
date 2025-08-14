import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_BASE_URL = `${BASE_URL}/api`;

// Generated Image interfaces
export interface GeneratedImageResponse {
  id: number;
  promptId?: number;
  userId: number;
  imageUrl: string;
  thumbnailUrl?: string;
  fileSize?: number;
  generationTime?: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  errorMessage?: string;
  isPublic: boolean;
  likesCount: number;
  downloadsCount: number;
  viewsCount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  username?: string;
}

export interface CreateImageRequest {
  promptId?: number;
  imageUrl: string;
  thumbnailUrl?: string;
  fileSize?: number;
  generationTime?: number;
  status?: 'pending' | 'generating' | 'completed' | 'failed';
  errorMessage?: string;
  isPublic?: boolean;
}

export interface WorkHistoryResponse {
  images: GeneratedImageResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

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

export const generatedImageApi = {
  // Get all user's generated images
  getUserImages: async (): Promise<GeneratedImageResponse[]> => {
    try {
      const response = await apiClient.get('/images/user/me');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user images:', error);
      console.error('Error details:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch user images');
    }
  },

  // Get user's work history with pagination
  getUserWorkHistory: async (
    page: number = 0,
    size: number = 20,
    searchTerm?: string
  ): Promise<WorkHistoryResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await apiClient.get(`/images/user/me/history?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching work history:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch work history');
    }
  },

  // Get recent user images (for chat display)
  getRecentUserImages: async (limit: number = 10): Promise<GeneratedImageResponse[]> => {
    try {
      const response = await apiClient.get('/images/user/me');
      
      // Sort by createdAt and take only the requested number
      const sortedImages = response.data
        .sort((a: GeneratedImageResponse, b: GeneratedImageResponse) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit);
      
      // Processed recent images
      return sortedImages;
    } catch (error: any) {
      console.error('Error fetching recent images:', error);
      console.error('Error details:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch recent images');
    }
  },

  // Get image by ID
  getImageById: async (id: number): Promise<GeneratedImageResponse> => {
    try {
      const response = await apiClient.get(`/images/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching image:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch image');
    }
  },

  // Create new image record
  createImage: async (imageData: CreateImageRequest): Promise<GeneratedImageResponse> => {
    try {
      const response = await apiClient.post('/images', imageData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating image record:', error);
      throw new Error(error.response?.data?.message || 'Failed to create image record');
    }
  },

  // Update image
  updateImage: async (id: number, imageData: Partial<CreateImageRequest>): Promise<GeneratedImageResponse> => {
    try {
      const response = await apiClient.put(`/images/${id}`, imageData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating image:', error);
      throw new Error(error.response?.data?.message || 'Failed to update image');
    }
  },

  // Delete image
  deleteImage: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/images/${id}`);
    } catch (error: any) {
      console.error('Error deleting image:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete image');
    }
  },

  // Increment likes count
  likeImage: async (id: number): Promise<void> => {
    try {
      await apiClient.post(`/images/${id}/like`);
    } catch (error: any) {
      console.error('Error liking image:', error);
      throw new Error(error.response?.data?.message || 'Failed to like image');
    }
  },

  // Increment downloads count
  downloadImage: async (id: number): Promise<void> => {
    try {
      await apiClient.post(`/images/${id}/download`);
    } catch (error: any) {
      console.error('Error recording download:', error);
      throw new Error(error.response?.data?.message || 'Failed to record download');
    }
  },

  // Increment views count
  viewImage: async (id: number): Promise<void> => {
    try {
      await apiClient.post(`/images/${id}/view`);
    } catch (error: any) {
      console.error('Error recording view:', error);
      throw new Error(error.response?.data?.message || 'Failed to record view');
    }
  },

  // Get public images
  getPublicImages: async (): Promise<GeneratedImageResponse[]> => {
    try {
      const response = await apiClient.get('/images/public');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching public images:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch public images');
    }
  },

  // Search images by prompt or metadata
  searchImages: async (searchTerm: string, page: number = 0, size: number = 20): Promise<WorkHistoryResponse> => {
    try {
      const response = await apiClient.get(`/images/search`, {
        params: {
          q: searchTerm,
          page,
          size,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error searching images:', error);
      throw new Error(error.response?.data?.message || 'Failed to search images');
    }
  },
};

// Utility functions for image handling
export const imageApiUtils = {
  // Format image for chat display
  formatImageForChat: (image: GeneratedImageResponse) => ({
    id: image.id.toString(),
    url: image.imageUrl,
    thumbnailUrl: image.thumbnailUrl || image.imageUrl,
    createdAt: new Date(image.createdAt),
    status: image.status,
    metadata: {
      fileSize: image.fileSize,
      generationTime: image.generationTime,
      likesCount: image.likesCount,
      downloadsCount: image.downloadsCount,
      viewsCount: image.viewsCount,
    },
  }),

  // Check if image is successfully generated
  isImageReady: (image: GeneratedImageResponse): boolean => {
    return image.status === 'completed' && !image.isDeleted && image.imageUrl;
  },

  // Get image URL with fallback
  getImageUrl: (image: GeneratedImageResponse, preferThumbnail: boolean = false): string => {
    if (preferThumbnail && image.thumbnailUrl) {
      return image.thumbnailUrl;
    }
    return image.imageUrl;
  },

  // Group images by date
  groupImagesByDate: (images: GeneratedImageResponse[]) => {
    const groups: { [key: string]: GeneratedImageResponse[] } = {};
    
    images.forEach(image => {
      const date = new Date(image.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(image);
    });

    return groups;
  },

  // Filter images by status
  filterImagesByStatus: (images: GeneratedImageResponse[], status: GeneratedImageResponse['status']) => {
    return images.filter(image => image.status === status);
  },

  // Sort images by creation date (newest first)
  sortImagesByDate: (images: GeneratedImageResponse[]): GeneratedImageResponse[] => {
    return [...images].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
};
