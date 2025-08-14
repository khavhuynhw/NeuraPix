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
@CrossOrigin(origins = {"http://localhost:5173"}, allowCredentials = "true")
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
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Received background removal request from user: {}", authentication.getName());

                if (!usageTrackingService.canProcessImage(authentication.getName())) {
                    logger.warn("User {} exceeded image processing usage limit", authentication.getName());
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("You have exceeded your image processing usage limit. Please upgrade your plan or wait for the next billing cycle.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                if (request.getImageUrl() == null || request.getImageUrl().trim().isEmpty()) {
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Please provide an image URL for background removal.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                PixelCutImageGenerationResponse response = pixelCutService.removeBackground(request).join();

                if (response.isSuccess()) {
                    usageTrackingService.trackImageProcessingUsage(authentication.getName());
                    logger.info("Tracked background removal usage for user: {}", authentication.getName());
                    
                    // Create GeneratedImage record for work history
                    createGeneratedImageRecord(authentication.getName(), response, "remove-background", 
                                             request.getImageUrl(), null);
                }
                
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                logger.error("Error removing background: {}", e.getMessage(), e);
                PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                    .success(false)
                    .errorMessage("Sorry, I encountered an error while removing the background. Please try again.")
                    .build();
                return ResponseEntity.ok(errorResponse);
            }
        });
    }

    @PostMapping("/generate-background")
    public CompletableFuture<ResponseEntity<PixelCutImageGenerationResponse>> generateBackground(
            @RequestBody PixelCutImageGenerationRequest request,
            Authentication authentication) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Received background generation request from user: {} - prompt: {}", 
                    authentication.getName(), request.getPrompt());

                if (!usageTrackingService.canProcessImage(authentication.getName())) {
                    logger.warn("User {} exceeded image processing usage limit", authentication.getName());
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("You have exceeded your image processing usage limit. Please upgrade your plan or wait for the next billing cycle.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                if (request.getImageUrl() == null || request.getImageUrl().trim().isEmpty()) {
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Please provide an image URL for background generation.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }
                
                if (request.getPrompt() == null || request.getPrompt().trim().isEmpty()) {
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Please provide a prompt describing the background you want to generate.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                PixelCutImageGenerationResponse response = pixelCutService.generateBackground(request).join();

                if (response.isSuccess()) {
                    usageTrackingService.trackImageProcessingUsage(authentication.getName());
                    logger.info("Tracked background generation usage for user: {}", authentication.getName());
                    
                    // Create GeneratedImage record for work history
                    createGeneratedImageRecord(authentication.getName(), response, "generate-background", 
                                             request.getImageUrl(), request.getPrompt());
                }
                
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                logger.error("Error generating background: {}", e.getMessage(), e);
                PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                    .success(false)
                    .errorMessage("Sorry, I encountered an error while generating the background. Please try again.")
                    .build();
                return ResponseEntity.ok(errorResponse);
            }
        });
    }

    @PostMapping("/upscale")
    public CompletableFuture<ResponseEntity<PixelCutImageGenerationResponse>> upscaleImage(
            @RequestBody PixelCutImageGenerationRequest request,
            Authentication authentication) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Received image upscale request from user: {}", authentication.getName());

                if (!usageTrackingService.canProcessImage(authentication.getName())) {
                    logger.warn("User {} exceeded image processing usage limit", authentication.getName());
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("You have exceeded your image processing usage limit. Please upgrade your plan or wait for the next billing cycle.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                if (request.getImageUrl() == null || request.getImageUrl().trim().isEmpty()) {
                    PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Please provide an image URL for upscaling.")
                        .build();
                    return ResponseEntity.ok(errorResponse);
                }

                if (request.getScale() != null) {
                    double scaleValue = request.getScale().doubleValue();
                    if (scaleValue < 2.0 || scaleValue > 4.0) {
                        PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                            .success(false)
                            .errorMessage("Scale factor must be between 2 and 4. Supported values: 2x, 4x")
                            .build();
                        return ResponseEntity.ok(errorResponse);
                    }
                }
                

                PixelCutImageGenerationResponse response = pixelCutService.upScale(request).join();

                if (response.isSuccess()) {
                    usageTrackingService.trackImageProcessingUsage(authentication.getName());
                    logger.info("Tracked image upscaling usage for user: {}", authentication.getName());
                    
                    // Create GeneratedImage record for work history
                    createGeneratedImageRecord(authentication.getName(), response, "upscale", 
                                             request.getImageUrl(), "Image upscaling " + request.getScale() + "x");
                }
                
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                logger.error("Error upscaling image: {}", e.getMessage(), e);
                PixelCutImageGenerationResponse errorResponse = PixelCutImageGenerationResponse.builder()
                    .success(false)
                    .errorMessage("Sorry, I encountered an error while upscaling the image. Please try again.")
                    .build();
                return ResponseEntity.ok(errorResponse);
            }
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