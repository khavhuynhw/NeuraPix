//package org.kh.neuralpix.controller;
//
//import org.kh.neuralpix.dto.gemini.GeminiChatRequest;
//import org.kh.neuralpix.dto.gemini.GeminiChatResponse;
//import org.kh.neuralpix.service.GeminiService;
//import org.kh.neuralpix.service.UsageTrackingService;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.concurrent.CompletableFuture;
//
//@RestController
//@RequestMapping("/api/chat")
//@CrossOrigin(origins = "*")
//public class GeminiChatController {
//
//    private static final Logger logger = LoggerFactory.getLogger(GeminiChatController.class);
//
//    @Autowired
//    private GeminiService geminiService;
//
//    @Autowired
//    private UsageTrackingService usageTrackingService;
//
//    @PostMapping("/message")
//    public CompletableFuture<ResponseEntity<GeminiChatResponse>> sendMessage(
//            @RequestBody GeminiChatRequest request,
//            Authentication authentication) {
//
//        return CompletableFuture.supplyAsync(() -> {
//            try {
//                logger.info("Received chat message request from user: {}", authentication.getName());
//
//                // Set userId from authentication
//                request.setUserId(authentication.getName());
//
//                // Check usage limits before processing
//                if (!usageTrackingService.canUseTextChat(authentication.getName())) {
//                    logger.warn("User {} exceeded text chat usage limit", authentication.getName());
//                    GeminiChatResponse errorResponse = GeminiChatResponse.createErrorResponse(
//                        request.getConversationId(),
//                        "You have exceeded your text chat usage limit. Please upgrade your plan or wait for the next billing cycle."
//                    );
//                    return ResponseEntity.ok(errorResponse);
//                }
//
//                // Process chat message
//                GeminiChatResponse response = geminiService.sendChatMessage(request).join();
//
//                // Track usage if successful
//                if (response.isComplete() && !response.getMessageType().equals("ERROR")) {
//                    usageTrackingService.trackTextChatUsage(authentication.getName());
//                    logger.info("Tracked text chat usage for user: {}", authentication.getName());
//                }
//
//                return ResponseEntity.ok(response);
//
//            } catch (Exception e) {
//                logger.error("Error processing chat message: {}", e.getMessage(), e);
//                GeminiChatResponse errorResponse = GeminiChatResponse.createErrorResponse(
//                    request.getConversationId(),
//                    "Sorry, I encountered an error while processing your message. Please try again."
//                );
//                return ResponseEntity.ok(errorResponse);
//            }
//        });
//    }
//
//    @PostMapping("/generate-image")
//    public CompletableFuture<ResponseEntity<GeminiChatResponse>> generateImage(
//            @RequestBody GeminiChatRequest request,
//            Authentication authentication) {
//
//        return CompletableFuture.supplyAsync(() -> {
//            try {
//                logger.info("Received image generation request from user: {} - prompt: {}",
//                    authentication.getName(), request.getMessage());
//
//                // Set userId from authentication
//                request.setUserId(authentication.getName());
//
//                // Check usage limits before processing
//                if (!usageTrackingService.canGenerateImage(authentication.getName())) {
//                    logger.warn("User {} exceeded image generation usage limit", authentication.getName());
//                    GeminiChatResponse errorResponse = GeminiChatResponse.createErrorResponse(
//                        request.getConversationId(),
//                        "You have exceeded your image generation usage limit. Please upgrade your plan or wait for the next billing cycle."
//                    );
//                    return ResponseEntity.ok(errorResponse);
//                }
//
//                // Generate image using Gemini + Google Imagen
//                GeminiChatResponse response = geminiService.generateImage(request).join();
//
//                // Track usage if successful
//                if (response.isComplete() && response.getMessageType().equals("IMAGE") &&
//                    response.getGeneratedImages() != null && !response.getGeneratedImages().isEmpty()) {
//                    usageTrackingService.trackImageGenerationUsage(authentication.getName(), 1);
//                    logger.info("Tracked image generation usage for user: {}", authentication.getName());
//                }
//
//                return ResponseEntity.ok(response);
//
//            } catch (Exception e) {
//                logger.error("Error generating image: {}", e.getMessage(), e);
//                GeminiChatResponse errorResponse = GeminiChatResponse.createErrorResponse(
//                    request.getConversationId(),
//                    "Sorry, I encountered an error while generating your image. Please try again."
//                );
//                return ResponseEntity.ok(errorResponse);
//            }
//        });
//    }
//
//    @PostMapping("/analyze-image")
//    public CompletableFuture<ResponseEntity<GeminiChatResponse>> analyzeImage(
//            @RequestBody GeminiChatRequest request,
//            Authentication authentication) {
//
//        return CompletableFuture.supplyAsync(() -> {
//            try {
//                logger.info("Received image analysis request from user: {}", authentication.getName());
//
//                // Set userId from authentication
//                request.setUserId(authentication.getName());
//
//                // Check usage limits before processing
//                if (!usageTrackingService.canAnalyzeImage(authentication.getName())) {
//                    logger.warn("User {} exceeded image analysis usage limit", authentication.getName());
//                    GeminiChatResponse errorResponse = GeminiChatResponse.createErrorResponse(
//                        request.getConversationId(),
//                        "You have exceeded your image analysis usage limit. Please upgrade your plan or wait for the next billing cycle."
//                    );
//                    return ResponseEntity.ok(errorResponse);
//                }
//
//                // Validate that images are provided
//                if (request.getImages() == null || request.getImages().isEmpty()) {
//                    GeminiChatResponse errorResponse = GeminiChatResponse.createErrorResponse(
//                        request.getConversationId(),
//                        "Please provide at least one image for analysis."
//                    );
//                    return ResponseEntity.ok(errorResponse);
//                }
//
//                // Analyze image using Gemini
//                GeminiChatResponse response = geminiService.analyzeImage(request).join();
//
//                // Track usage if successful
//                if (response.isComplete() && !response.getMessageType().equals("ERROR")) {
//                    usageTrackingService.trackImageAnalysisUsage(authentication.getName());
//                    logger.info("Tracked image analysis usage for user: {}", authentication.getName());
//                }
//
//                return ResponseEntity.ok(response);
//
//            } catch (Exception e) {
//                logger.error("Error analyzing image: {}", e.getMessage(), e);
//                GeminiChatResponse errorResponse = GeminiChatResponse.createErrorResponse(
//                    request.getConversationId(),
//                    "Sorry, I encountered an error while analyzing your image. Please try again."
//                );
//                return ResponseEntity.ok(errorResponse);
//            }
//        });
//    }
//
//    @PostMapping("/multimodal")
//    public CompletableFuture<ResponseEntity<GeminiChatResponse>> processMultiModal(
//            @RequestBody GeminiChatRequest request,
//            Authentication authentication) {
//
//        return CompletableFuture.supplyAsync(() -> {
//            try {
//                logger.info("Received multimodal request from user: {}", authentication.getName());
//
//                // Set userId from authentication
//                request.setUserId(authentication.getName());
//
//                // Check usage limits before processing (use image analysis limits for multimodal)
//                if (!usageTrackingService.canAnalyzeImage(authentication.getName())) {
//                    logger.warn("User {} exceeded multimodal usage limit", authentication.getName());
//                    GeminiChatResponse errorResponse = GeminiChatResponse.createErrorResponse(
//                        request.getConversationId(),
//                        "You have exceeded your multimodal processing usage limit. Please upgrade your plan or wait for the next billing cycle."
//                    );
//                    return ResponseEntity.ok(errorResponse);
//                }
//
//                // Process multimodal input using Gemini
//                GeminiChatResponse response = geminiService.processMultiModal(request).join();
//
//                // Track usage if successful
//                if (response.isComplete() && !response.getMessageType().equals("ERROR")) {
//                    usageTrackingService.trackImageAnalysisUsage(authentication.getName());
//                    logger.info("Tracked multimodal usage for user: {}", authentication.getName());
//                }
//
//                return ResponseEntity.ok(response);
//
//            } catch (Exception e) {
//                logger.error("Error processing multimodal input: {}", e.getMessage(), e);
//                GeminiChatResponse errorResponse = GeminiChatResponse.createErrorResponse(
//                    request.getConversationId(),
//                    "Sorry, I encountered an error while processing your request. Please try again."
//                );
//                return ResponseEntity.ok(errorResponse);
//            }
//        });
//    }
//
//    @GetMapping("/health")
//    public ResponseEntity<String> healthCheck() {
//        return ResponseEntity.ok("Gemini Chat Controller is running!");
//    }
//}