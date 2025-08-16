import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface VertexAIImageRequest {
  prompt: string;
  negativePrompt?: string;
  numberOfImages?: number;
  aspectRatio?: string;
  seed?: number;
  guidanceScale?: string;
  baseImage?: string;
  maskImage?: string;
  mode?: string;
  language?: string;
  addWatermark?: boolean;
  safetyFilterLevel?: string;
  personGeneration?: string;
}

export interface GeneratedImageData {
  imageUrl: string;
  base64Data?: string;
  width?: number;
  height?: number;
  format?: string;
  fileSize?: number;
  safetyRating?: string;
}

export interface VertexAIImageResponse {
  success: boolean;
  errorMessage?: string;
  images?: GeneratedImageData[];
  requestId?: string;
  processingTimeMs?: number;
}

class VertexAIApi {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async generateImage(request: VertexAIImageRequest): Promise<VertexAIImageResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/vertexai/generate-image`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating image with Vertex AI:', error);
      throw error;
    }
  }

  async editImage(request: VertexAIImageRequest): Promise<VertexAIImageResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/vertexai/edit-image`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error editing image with Vertex AI:', error);
      throw error;
    }
  }

  async upscaleImage(request: VertexAIImageRequest): Promise<VertexAIImageResponse> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/vertexai/upscale-image`,
        request,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error upscaling image with Vertex AI:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<{ available: boolean; message: string }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/vertexai/health`,
        { headers: this.getAuthHeaders() }
      );
      return { available: true, message: response.data };
    } catch (error) {
      console.error('Vertex AI service health check failed:', error);
      return { available: false, message: 'Service unavailable' };
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/vertexai/models`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting available models:', error);
      return [];
    }
  }
}

export const vertexaiApi = new VertexAIApi();