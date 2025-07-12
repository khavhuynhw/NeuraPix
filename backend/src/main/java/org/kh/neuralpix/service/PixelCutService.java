package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.pixelcut.PixelCutImageGenerationRequest;
import org.kh.neuralpix.dto.pixelcut.PixelCutImageGenerationResponse;
import org.kh.neuralpix.model.Prompt;

import java.util.concurrent.CompletableFuture;

public interface PixelCutService {
    
    /**
     * Generate image using PixelCut.ai API
     * @param request The image generation request
     * @return CompletableFuture with the generation response
     */
    CompletableFuture<PixelCutImageGenerationResponse> generateImage(PixelCutImageGenerationRequest request);
    CompletableFuture<PixelCutImageGenerationResponse> upScale(PixelCutImageGenerationRequest request);
    CompletableFuture<PixelCutImageGenerationResponse> removeBackground(PixelCutImageGenerationRequest request);
    CompletableFuture<PixelCutImageGenerationResponse> generateBackground(PixelCutImageGenerationRequest request);
    /**
     * Generate image from a Prompt entity
     * @param prompt The prompt entity
     * @return CompletableFuture with the generation response
     */
    CompletableFuture<PixelCutImageGenerationResponse> generateImageFromPrompt(Prompt prompt);
    
    /**
     * Check the status of a generation task
     * @param taskId The task ID
     * @return The current status
     */
    String checkGenerationStatus(String taskId);
    
    /**
     * Get available models from PixelCut.ai
     * @return List of available models
     */
    String[] getAvailableModels();
    
    /**
     * Get available styles from PixelCut.ai
     * @return List of available styles
     */
    String[] getAvailableStyles();
} 