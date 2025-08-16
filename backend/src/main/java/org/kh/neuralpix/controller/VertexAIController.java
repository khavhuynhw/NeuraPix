package org.kh.neuralpix.controller;

import org.kh.neuralpix.dto.vertexai.VertexAIImageRequest;
import org.kh.neuralpix.dto.vertexai.VertexAIImageResponse;
import org.kh.neuralpix.model.GeneratedImage;
import org.kh.neuralpix.service.GeneratedImageService;
import org.kh.neuralpix.service.UsageTrackingService;
import org.kh.neuralpix.service.UserService;
import org.kh.neuralpix.service.VertexAIImagenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/vertexai")
@CrossOrigin(origins = {"http://localhost:5173", "https://neura-pix-chi.vercel.app"}, allowCredentials = "true")
public class VertexAIController {

    private static final Logger logger = LoggerFactory.getLogger(VertexAIController.class);

    @Autowired
    private VertexAIImagenService vertexAIImagenService;

    @Autowired
    private UsageTrackingService usageTrackingService;

    @Autowired
    private GeneratedImageService generatedImageService;

    @Autowired
    private UserService userService;

    @PostMapping("/generate-image")
    public CompletableFuture<ResponseEntity<VertexAIImageResponse>> generateImage(
            @RequestBody VertexAIImageRequest request,
            Authentication authentication) {
        
        String correlationId = java.util.UUID.randomUUID().toString().substring(0, 8);
        logger.info("[{}] Received Vertex AI image generation request from user: {} - prompt: {}", 
            correlationId, authentication.getName(), request.getPrompt());
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Validate usage limits
                if (!usageTrackingService.canProcessImage(authentication.getName())) {
                    logger.warn("[{}] User {} exceeded image processing usage limit", correlationId, authentication.getName());
                    VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                        .success(false)
                        .errorMessage("You have exceeded your image processing usage limit. Please upgrade your plan or wait for the next billing cycle.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                // Validate request
                if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                    logger.warn("[{}] Invalid request - missing prompt", correlationId);
                    VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                        .success(false)
                        .errorMessage("Please provide a prompt for image generation.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                // Set default values if not provided
                if (request.getNumberOfImages() == null || request.getNumberOfImages() < 1) {
                    request.setNumberOfImages(1);
                }
                if (request.getAspectRatio() == null) {
                    request.setAspectRatio("1:1");
                }

                // Process image generation
                logger.info("[{}] Starting Vertex AI image generation for user: {}", correlationId, authentication.getName());
                VertexAIImageResponse response = vertexAIImagenService.generateImage(request).join();
                
                if (response == null) {
                    logger.error("[{}] Received null response from Vertex AI service", correlationId);
                    VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                        .success(false)
                        .errorMessage("Failed to generate image. Please try again.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                logger.info("[{}] Vertex AI processing completed. Success: {}", correlationId, response.isSuccess());

                if (response.isSuccess()) {
                    // Track usage - don't fail if this fails
                    try {
                        usageTrackingService.trackImageProcessingUsage(authentication.getName());
                        logger.info("[{}] Tracked image generation usage for user: {}", correlationId, authentication.getName());
                    } catch (Exception usageEx) {
                        logger.error("[{}] Failed to track usage for user {}: {}", correlationId, authentication.getName(), usageEx.getMessage());
                    }
                    
                    // Create GeneratedImage record - don't fail if this fails
                    try {
                        createGeneratedImageRecord(authentication.getName(), response, "vertex-ai-text-to-image", 
                                                 request.getPrompt(), correlationId);
                        logger.info("[{}] Created GeneratedImage record for user: {}", correlationId, authentication.getName());
                    } catch (Exception recordEx) {
                        logger.error("[{}] Failed to create GeneratedImage record for user {}: {}", correlationId, authentication.getName(), recordEx.getMessage());
                    }
                }
                
                logger.info("[{}] Returning response to user: {} - Success: {}", correlationId, authentication.getName(), response.isSuccess());
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                logger.error("[{}] Unexpected error in image generation for user {}: {}", correlationId, authentication.getName(), e.getMessage(), e);
                VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                    .success(false)
                    .errorMessage("Sorry, I encountered an error while generating the image. Please try again.")
                    .build();
                return ResponseEntity.ok(errorResponse);
            }
        }).exceptionally(throwable -> {
            logger.error("[{}] CompletableFuture exception for user {}: {}", correlationId, authentication.getName(), throwable.getMessage(), throwable);
            VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                .success(false)
                .errorMessage("Service temporarily unavailable. Please try again.")
                .build();
            return ResponseEntity.ok(errorResponse);
        });
    }

    @PostMapping("/edit-image")
    public CompletableFuture<ResponseEntity<VertexAIImageResponse>> editImage(
            @RequestBody VertexAIImageRequest request,
            Authentication authentication) {
        
        String correlationId = java.util.UUID.randomUUID().toString().substring(0, 8);
        logger.info("[{}] Received Vertex AI image editing request from user: {}", correlationId, authentication.getName());
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Validate usage limits
                if (!usageTrackingService.canProcessImage(authentication.getName())) {
                    logger.warn("[{}] User {} exceeded image processing usage limit", correlationId, authentication.getName());
                    VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                        .success(false)
                        .errorMessage("You have exceeded your image processing usage limit. Please upgrade your plan or wait for the next billing cycle.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                // Validate request
                if (request.getBaseImage() == null || request.getBaseImage().trim().isEmpty()) {
                    logger.warn("[{}] Invalid request - missing base image", correlationId);
                    VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                        .success(false)
                        .errorMessage("Please provide a base image for editing.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                    logger.warn("[{}] Invalid request - missing prompt", correlationId);
                    VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                        .success(false)
                        .errorMessage("Please provide a prompt for image editing.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                // Process image editing
                logger.info("[{}] Starting Vertex AI image editing for user: {}", correlationId, authentication.getName());
                VertexAIImageResponse response = vertexAIImagenService.editImage(request).join();
                
                if (response == null) {
                    logger.error("[{}] Received null response from Vertex AI service", correlationId);
                    VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                        .success(false)
                        .errorMessage("Failed to edit image. Please try again.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                logger.info("[{}] Vertex AI editing completed. Success: {}", correlationId, response.isSuccess());

                if (response.isSuccess()) {
                    try {
                        usageTrackingService.trackImageProcessingUsage(authentication.getName());
                        logger.info("[{}] Tracked image editing usage for user: {}", correlationId, authentication.getName());
                    } catch (Exception usageEx) {
                        logger.error("[{}] Failed to track usage for user {}: {}", correlationId, authentication.getName(), usageEx.getMessage());
                    }
                    
                    try {
                        createGeneratedImageRecord(authentication.getName(), response, "vertex-ai-image-edit", 
                                                 request.getPrompt(), correlationId);
                        logger.info("[{}] Created GeneratedImage record for user: {}", correlationId, authentication.getName());
                    } catch (Exception recordEx) {
                        logger.error("[{}] Failed to create GeneratedImage record for user {}: {}", correlationId, authentication.getName(), recordEx.getMessage());
                    }
                }
                
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                logger.error("[{}] Unexpected error in image editing for user {}: {}", correlationId, authentication.getName(), e.getMessage(), e);
                VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                    .success(false)
                    .errorMessage("Sorry, I encountered an error while editing the image. Please try again.")
                    .build();
                return ResponseEntity.ok(errorResponse);
            }
        }).exceptionally(throwable -> {
            logger.error("[{}] CompletableFuture exception for user {}: {}", correlationId, authentication.getName(), throwable.getMessage(), throwable);
            VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                .success(false)
                .errorMessage("Service temporarily unavailable. Please try again.")
                .build();
            return ResponseEntity.ok(errorResponse);
        });
    }

    @PostMapping("/upscale-image")
    public CompletableFuture<ResponseEntity<VertexAIImageResponse>> upscaleImage(
            @RequestBody VertexAIImageRequest request,
            Authentication authentication) {
        
        String correlationId = java.util.UUID.randomUUID().toString().substring(0, 8);
        logger.info("[{}] Received Vertex AI image upscaling request from user: {}", correlationId, authentication.getName());
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Validate usage limits
                if (!usageTrackingService.canProcessImage(authentication.getName())) {
                    logger.warn("[{}] User {} exceeded image processing usage limit", correlationId, authentication.getName());
                    VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                        .success(false)
                        .errorMessage("You have exceeded your image processing usage limit. Please upgrade your plan or wait for the next billing cycle.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                // Validate request
                if (request.getBaseImage() == null || request.getBaseImage().trim().isEmpty()) {
                    logger.warn("[{}] Invalid request - missing base image", correlationId);
                    VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                        .success(false)
                        .errorMessage("Please provide an image for upscaling.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                // Process image upscaling
                logger.info("[{}] Starting Vertex AI image upscaling for user: {}", correlationId, authentication.getName());
                VertexAIImageResponse response = vertexAIImagenService.upscaleImage(request).join();
                
                if (response == null) {
                    logger.error("[{}] Received null response from Vertex AI service", correlationId);
                    VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                        .success(false)
                        .errorMessage("Failed to upscale image. Please try again.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                logger.info("[{}] Vertex AI upscaling completed. Success: {}", correlationId, response.isSuccess());

                if (response.isSuccess()) {
                    try {
                        usageTrackingService.trackImageProcessingUsage(authentication.getName());
                        logger.info("[{}] Tracked image upscaling usage for user: {}", correlationId, authentication.getName());
                    } catch (Exception usageEx) {
                        logger.error("[{}] Failed to track usage for user {}: {}", correlationId, authentication.getName(), usageEx.getMessage());
                    }
                    
                    try {
                        createGeneratedImageRecord(authentication.getName(), response, "vertex-ai-upscale", 
                                                 "Image upscaling", correlationId);
                        logger.info("[{}] Created GeneratedImage record for user: {}", correlationId, authentication.getName());
                    } catch (Exception recordEx) {
                        logger.error("[{}] Failed to create GeneratedImage record for user {}: {}", correlationId, authentication.getName(), recordEx.getMessage());
                    }
                }
                
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                logger.error("[{}] Unexpected error in image upscaling for user {}: {}", correlationId, authentication.getName(), e.getMessage(), e);
                VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                    .success(false)
                    .errorMessage("Sorry, I encountered an error while upscaling the image. Please try again.")
                    .build();
                return ResponseEntity.ok(errorResponse);
            }
        }).exceptionally(throwable -> {
            logger.error("[{}] CompletableFuture exception for user {}: {}", correlationId, authentication.getName(), throwable.getMessage(), throwable);
            VertexAIImageResponse errorResponse = VertexAIImageResponse.builder()
                .success(false)
                .errorMessage("Service temporarily unavailable. Please try again.")
                .build();
            return ResponseEntity.ok(errorResponse);
        });
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        boolean serviceAvailable = vertexAIImagenService.isServiceAvailable();
        if (serviceAvailable) {
            return ResponseEntity.ok("Vertex AI Imagen service is available");
        } else {
            return ResponseEntity.status(503).body("Vertex AI Imagen service is unavailable");
        }
    }

    @GetMapping("/models")
    public ResponseEntity<String[]> getAvailableModels() {
        String[] models = vertexAIImagenService.getAvailableModels();
        return ResponseEntity.ok(models);
    }

    /**
     * Helper method to create GeneratedImage record for work history tracking
     */
    private void createGeneratedImageRecord(String username, VertexAIImageResponse response, 
                                          String operation, String prompt, String correlationId) {
        try {
            // Get user ID
            Long userId = userService.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    .getId();
            
            // Get the processed image URL from response
            String processedImageUrl = null;
            Integer fileSize = null;
            
            if (response.getImages() != null && !response.getImages().isEmpty()) {
                VertexAIImageResponse.GeneratedImageData firstImage = response.getImages().get(0);
                processedImageUrl = firstImage.getImageUrl();
                fileSize = firstImage.getFileSize();
            }
            
            if (processedImageUrl != null) {
                // Create GeneratedImage record
                GeneratedImage generatedImage = generatedImageService.createImageFromPixelCutProcessing(
                    processedImageUrl,
                    null, // No thumbnail for Vertex AI operations
                    userId,
                    fileSize,
                    operation,
                    prompt
                );
                
                logger.info("Created GeneratedImage record {} for {} operation by user {}", 
                           generatedImage.getId(), operation, username);
            } else {
                logger.warn("No processed image URL found in Vertex AI response for {} operation", operation);
            }
            
        } catch (Exception e) {
            logger.error("Failed to create GeneratedImage record for {} operation by user {}: {}", 
                        operation, username, e.getMessage(), e);
        }
    }
}