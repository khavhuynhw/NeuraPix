import { geminiApi } from '../services/geminiApi';
import type { GeminiChatRequest } from '../services/geminiApi';

export const testApiConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    // Test with a simple message
    const testRequest: GeminiChatRequest = {
      message: "Hello, this is a connection test. Please respond with 'Connection successful'.",
      conversationId: "test-connection",
    };

    const response = await geminiApi.sendMessage(testRequest);
    
    if (response.content && response.messageType === 'TEXT') {
      return {
        success: true,
        message: 'API connection successful! Gemini AI is responding.',
        details: {
          responseType: response.messageType,
          hasContent: !!response.content,
          timestamp: response.timestamp,
        }
      };
    } else {
      return {
        success: false,
        message: 'API responded but with unexpected format.',
        details: response,
      };
    }
  } catch (error: any) {
    console.error('API connection test failed:', error);
    
    let errorMessage = 'Connection failed: ';
    
    if (error.response?.status === 401) {
      errorMessage += 'Authentication error. Please check your login status.';
    } else if (error.response?.status === 400) {
      errorMessage += 'Bad request. API configuration may be incorrect.';
    } else if (error.response?.status === 403) {
      errorMessage += 'Access forbidden. Check API permissions.';
    } else if (error.response?.status === 429) {
      errorMessage += 'Too many requests. Please wait before testing again.';
    } else if (error.response?.status >= 500) {
      errorMessage += 'Server error. Backend may be down.';
    } else if (error.message?.includes('Network Error')) {
      errorMessage += 'Network error. Check your internet connection.';
    } else {
      errorMessage += error.message || 'Unknown error occurred.';
    }

    return {
      success: false,
      message: errorMessage,
      details: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        code: error.code,
      }
    };
  }
};

export const testImageAnalysis = async (testImageBase64: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    const testRequest: GeminiChatRequest = {
      message: "Please analyze this test image and describe what you see.",
      conversationId: "test-image-analysis",
      images: [testImageBase64],
    };

    const response = await geminiApi.analyzeImage(testRequest);
    
    if (response.content && response.messageType === 'TEXT') {
      return {
        success: true,
        message: 'Image analysis successful! Gemini can analyze images.',
        details: {
          responseLength: response.content.length,
          analysisPreview: response.content.substring(0, 100) + '...',
        }
      };
    } else {
      return {
        success: false,
        message: 'Image analysis responded but with unexpected format.',
        details: response,
      };
    }
  } catch (error: any) {
    console.error('Image analysis test failed:', error);
    
    return {
      success: false,
      message: `Image analysis failed: ${error.message || 'Unknown error'}`,
      details: error.response || error,
    };
  }
};

// Development helper function to log API configuration
export const logApiConfig = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const hasToken = !!localStorage.getItem('accessToken');
  
  console.log('=== API Configuration ===');
  console.log('Base URL:', apiBaseUrl);
  console.log('Has Auth Token:', hasToken);
  console.log('Token Preview:', hasToken ? localStorage.getItem('accessToken')?.substring(0, 20) + '...' : 'None');
  console.log('========================');
};