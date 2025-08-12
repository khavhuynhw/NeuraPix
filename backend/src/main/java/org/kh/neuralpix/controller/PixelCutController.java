package org.kh.neuralpix.controller;

import org.kh.neuralpix.dto.pixelcut.PixelCutImageGenerationRequest;
import org.kh.neuralpix.dto.pixelcut.PixelCutImageGenerationResponse;
import org.kh.neuralpix.service.PixelCutService;
import org.kh.neuralpix.service.UsageTrackingService;
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
}