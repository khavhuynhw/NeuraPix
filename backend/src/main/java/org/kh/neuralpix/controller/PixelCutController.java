package org.kh.neuralpix.controller;

import org.kh.neuralpix.dto.pixelcut.PixelCutImageGenerationRequest;
import org.kh.neuralpix.dto.pixelcut.PixelCutImageGenerationResponse;
import org.kh.neuralpix.model.GeneratedImage;
import org.kh.neuralpix.service.GeneratedImageService;
import org.kh.neuralpix.service.PixelCutService;
import org.kh.neuralpix.service.UsageTrackingService;
import org.kh.neuralpix.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/pixelcut")
@CrossOrigin(origins = {"http://localhost:5173", "https://neura-pix-chi.vercel.app"}, allowCredentials = "true")
public class PixelCutController {

    private static final Logger logger = LoggerFactory.getLogger(PixelCutController.class);

    @Autowired
    private PixelCutService pixelCutService;

    @Autowired
    private UsageTrackingService usageTrackingService;

    @Autowired
    private GeneratedImageService generatedImageService;

    @Autowired
    private UserService userService;

    @PostMapping("/remove-background")
    public CompletableFuture<ResponseEntity<PixelCutImageGenerationResponse>> removeBackground(
            @RequestBody PixelCutImageGenerationRequest request,
            Authentication authentication) {
        
        String correlationId = java.util.UUID.randomUUID().toString().substring(0, 8);
        logger.info("[{}] Received background removal request from user: {}", correlationId, authentication.getName());
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Validate usage limits
                if (!usageTrackingService.canProcessImage(authentication.getName())) {
                    logger.warn("[{}] User {} exceeded image processing usage limit", correlationId, authentication.getName());
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("You have exceeded your image processing usage limit. Please upgrade your plan or wait for the next billing cycle.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                // Validate request
                if (request.getImageUrl() == null || request.getImageUrl().trim().isEmpty()) {
                    logger.warn("[{}] Invalid request - missing image URL", correlationId);
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Please provide an image URL for background removal.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                // Process image
                logger.info("[{}] Starting PixelCut background removal for user: {}", correlationId, authentication.getName());
                PixelCutImageGenerationResponse response = pixelCutService.removeBackground(request).join();
                
                if (response == null) {
                    logger.error("[{}] Received null response from PixelCut service", correlationId);
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Failed to process image. Please try again.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                logger.info("[{}] PixelCut processing completed. Success: {}", correlationId, response.isSuccess());

                if (response.isSuccess()) {
                    // Track usage - don't fail if this fails
                    try {
                        usageTrackingService.trackImageProcessingUsage(authentication.getName());
                        logger.info("[{}] Tracked background removal usage for user: {}", correlationId, authentication.getName());
                    } catch (Exception usageEx) {
                        logger.error("[{}] Failed to track usage for user {}: {}", correlationId, authentication.getName(), usageEx.getMessage());
                        // Continue - don't fail the main operation
                    }
                    
                    // Create GeneratedImage record - don't fail if this fails
                    try {
                        createGeneratedImageRecord(authentication.getName(), response, "remove-background", 
                                                 request.getImageUrl(), null);
                        logger.info("[{}] Created GeneratedImage record for user: {}", correlationId, authentication.getName());
                    } catch (Exception recordEx) {
                        logger.error("[{}] Failed to create GeneratedImage record for user {}: {}", correlationId, authentication.getName(), recordEx.getMessage());
                        // Continue - don't fail the main operation
                    }
                }
                
                logger.info("[{}] Returning response to user: {} - Success: {}", correlationId, authentication.getName(), response.isSuccess());
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                logger.error("[{}] Unexpected error in background removal for user {}: {}", correlationId, authentication.getName(), e.getMessage(), e);
                PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                    .success(false)
                    .errorMessage("Sorry, I encountered an error while removing the background. Please try again.")
                    .build();
                return ResponseEntity.ok(errorResponse);
            }
        }).exceptionally(throwable -> {
            logger.error("[{}] CompletableFuture exception for user {}: {}", correlationId, authentication.getName(), throwable.getMessage(), throwable);
            PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                .success(false)
                .errorMessage("Service temporarily unavailable. Please try again.")
                .build();
            return ResponseEntity.ok(errorResponse);
        });
    }

    
    @PostMapping("/generate-background")
    public CompletableFuture<ResponseEntity<PixelCutImageGenerationResponse>> generateBackground(
            @RequestBody PixelCutImageGenerationRequest request,
            Authentication authentication) {
        
        String correlationId = java.util.UUID.randomUUID().toString().substring(0, 8);
        logger.info("[{}] Received background generation request from user: {} - prompt: {}", 
            correlationId, authentication.getName(), request.getPrompt());
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Validate usage limits
                if (!usageTrackingService.canProcessImage(authentication.getName())) {
                    logger.warn("[{}] User {} exceeded image processing usage limit", correlationId, authentication.getName());
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("You have exceeded your image processing usage limit. Please upgrade your plan or wait for the next billing cycle.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                // Validate request
                if (request.getImageUrl() == null || request.getImageUrl().trim().isEmpty()) {
                    logger.warn("[{}] Invalid request - missing image URL", correlationId);
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Please provide an image URL for background generation.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }
                
                if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                    logger.warn("[{}] Invalid request - missing prompt", correlationId);
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Please provide a prompt describing the background you want to generate.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                // Process image
                logger.info("[{}] Starting PixelCut background generation for user: {}", correlationId, authentication.getName());
                PixelCutImageGenerationResponse response = pixelCutService.generateBackground(request).join();

                if (response == null) {
                    logger.error("[{}] Received null response from PixelCut service", correlationId);
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Failed to process image. Please try again.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                logger.info("[{}] PixelCut processing completed. Success: {}", correlationId, response.isSuccess());

                if (response.isSuccess()) {
                    // Track usage - don't fail if this fails
                    try {
                        usageTrackingService.trackImageProcessingUsage(authentication.getName());
                        logger.info("[{}] Tracked background generation usage for user: {}", correlationId, authentication.getName());
                    } catch (Exception usageEx) {
                        logger.error("[{}] Failed to track usage for user {}: {}", correlationId, authentication.getName(), usageEx.getMessage());
                    }
                    
                    // Create GeneratedImage record - don't fail if this fails
                    try {
                        createGeneratedImageRecord(authentication.getName(), response, "generate-background", 
                                                 request.getImageUrl(), request.getPrompt());
                        logger.info("[{}] Created GeneratedImage record for user: {}", correlationId, authentication.getName());
                    } catch (Exception recordEx) {
                        logger.error("[{}] Failed to create GeneratedImage record for user {}: {}", correlationId, authentication.getName(), recordEx.getMessage());
                    }
                }
                
                logger.info("[{}] Returning response to user: {} - Success: {}", correlationId, authentication.getName(), response.isSuccess());
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                logger.error("[{}] Unexpected error in background generation for user {}: {}", correlationId, authentication.getName(), e.getMessage(), e);
                PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                    .success(false)
                    .errorMessage("Sorry, I encountered an error while generating the background. Please try again.")
                    .build();
                return ResponseEntity.ok(errorResponse);
            }
        }).exceptionally(throwable -> {
            logger.error("[{}] CompletableFuture exception for user {}: {}", correlationId, authentication.getName(), throwable.getMessage(), throwable);
            PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                .success(false)
                .errorMessage("Service temporarily unavailable. Please try again.")
                .build();
            return ResponseEntity.ok(errorResponse);
        });
    }

    @PostMapping("/upscale")
    public CompletableFuture<ResponseEntity<PixelCutImageGenerationResponse>> upscaleImage(
            @RequestBody PixelCutImageGenerationRequest request,
            Authentication authentication) {
        
        String correlationId = java.util.UUID.randomUUID().toString().substring(0, 8);
        logger.info("[{}] Received image upscale request from user: {}", correlationId, authentication.getName());
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Validate usage limits
                if (!usageTrackingService.canProcessImage(authentication.getName())) {
                    logger.warn("[{}] User {} exceeded image processing usage limit", correlationId, authentication.getName());
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("You have exceeded your image processing usage limit. Please upgrade your plan or wait for the next billing cycle.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                // Validate request
                if (request.getImageUrl() == null || request.getImageUrl().trim().isEmpty()) {
                    logger.warn("[{}] Invalid request - missing image URL", correlationId);
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Please provide an image URL for upscaling.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                if (request.getScale() != null) {
                    double scaleValue = request.getScale().doubleValue();
                    if (scaleValue < 2.0 || scaleValue > 4.0) {
                        logger.warn("[{}] Invalid scale value: {}", correlationId, scaleValue);
                        PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                            .success(false)
                            .errorMessage("Scale factor must be between 2 and 4. Supported values: 2x, 4x")
                            .build();
                        return ResponseEntity.ok(errorResponse);
                    }
                }

                // Process image
                logger.info("[{}] Starting PixelCut image upscaling for user: {}", correlationId, authentication.getName());
                PixelCutImageGenerationResponse response = pixelCutService.upScale(request).join();

                if (response == null) {
                    logger.error("[{}] Received null response from PixelCut service", correlationId);
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Failed to process image. Please try again.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                logger.info("[{}] PixelCut processing completed. Success: {}", correlationId, response.isSuccess());

                if (response.isSuccess()) {
                    // Track usage - don't fail if this fails
                    try {
                        usageTrackingService.trackImageProcessingUsage(authentication.getName());
                        logger.info("[{}] Tracked image upscaling usage for user: {}", correlationId, authentication.getName());
                    } catch (Exception usageEx) {
                        logger.error("[{}] Failed to track usage for user {}: {}", correlationId, authentication.getName(), usageEx.getMessage());
                    }
                    
                    // Create GeneratedImage record - don't fail if this fails
                    try {
                        createGeneratedImageRecord(authentication.getName(), response, "upscale", 
                                                 request.getImageUrl(), "Image upscaling " + request.getScale() + "x");
                        logger.info("[{}] Created GeneratedImage record for user: {}", correlationId, authentication.getName());
                    } catch (Exception recordEx) {
                        logger.error("[{}] Failed to create GeneratedImage record for user {}: {}", correlationId, authentication.getName(), recordEx.getMessage());
                    }
                }
                
                logger.info("[{}] Returning response to user: {} - Success: {}", correlationId, authentication.getName(), response.isSuccess());
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                logger.error("[{}] Unexpected error in image upscaling for user {}: {}", correlationId, authentication.getName(), e.getMessage(), e);
                PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                    .success(false)
                    .errorMessage("Sorry, I encountered an error while upscaling the image. Please try again.")
                    .build();
                return ResponseEntity.ok(errorResponse);
            }
        }).exceptionally(throwable -> {
            logger.error("[{}] CompletableFuture exception for user {}: {}", correlationId, authentication.getName(), throwable.getMessage(), throwable);
            PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                .success(false)
                .errorMessage("Service temporarily unavailable. Please try again.")
                .build();
            return ResponseEntity.ok(errorResponse);
        });
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("PixelCut Controller is running!");
    }

    /**
     * Helper method to create GeneratedImage record for work history tracking
     */
    private void createGeneratedImageRecord(String username, PixelCutImageGenerationResponse response, 
                                          String operation, String originalImageUrl, String prompt) {
        try {
            // Get user ID
            Long userId = userService.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    .getId();
            
            // Get the processed image URL from response
            String processedImageUrl = null;
            Integer fileSize = null;
            
            if (response.getImageUrls() != null && !response.getImageUrls().isEmpty()) {
                processedImageUrl = response.getImageUrls().get(0);
            } else if (response.getImages() != null && !response.getImages().isEmpty()) {
                processedImageUrl = response.getImages().get(0).getImageUrl();
                fileSize = response.getImages().get(0).getFileSize();
            }
            
            if (processedImageUrl != null) {
                // Create GeneratedImage record without prompt
                String promptText = prompt != null ? prompt : (operation + " operation");
                GeneratedImage generatedImage = generatedImageService.createImageFromPixelCutProcessing(
                    processedImageUrl,
                    null, // No thumbnail for PixelCut operations
                    userId,
                    fileSize,
                    operation,
                    promptText
                );
                
                logger.info("Created GeneratedImage record {} for {} operation by user {}", 
                           generatedImage.getId(), operation, username);
            } else {
                logger.warn("No processed image URL found in PixelCut response for {} operation", operation);
            }
            
        } catch (Exception e) {
            logger.error("Failed to create GeneratedImage record for {} operation by user {}: {}", 
                        operation, username, e.getMessage(), e);
            // Don't fail the main operation, just log the error
        }
    }
}