package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.vertexai.VertexAIImageRequest;
import org.kh.neuralpix.dto.vertexai.VertexAIImageResponse;

import java.util.concurrent.CompletableFuture;

public interface VertexAIImagenService {
    
    /**
     * Generate image from text prompt using Vertex AI Imagen
     * @param request The image generation request
     * @return CompletableFuture with the generation response
     */
    CompletableFuture<VertexAIImageResponse> generateImage(VertexAIImageRequest request);
    
    /**
     * Generate image from text with user tracking
     * @param request The image generation request
     * @param userId The user ID for tracking
     * @return CompletableFuture with the generation response
     */
    CompletableFuture<VertexAIImageResponse> generateImage(VertexAIImageRequest request, Long userId);
    
    /**
     * Edit image using inpainting with mask
     * @param request The image edit request
     * @return CompletableFuture with the edit response
     */
    CompletableFuture<VertexAIImageResponse> editImage(VertexAIImageRequest request);
    
    /**
     * Upscale image using Vertex AI
     * @param request The upscale request
     * @return CompletableFuture with the upscale response
     */
    CompletableFuture<VertexAIImageResponse> upscaleImage(VertexAIImageRequest request);
    
    /**
     * Check if Vertex AI service is available
     * @return true if service is available
     */
    boolean isServiceAvailable();
    
    /**
     * Get available models
     * @return Array of available model names
     */
    String[] getAvailableModels();
}