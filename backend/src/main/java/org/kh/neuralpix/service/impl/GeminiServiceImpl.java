package org.kh.neuralpix.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.kh.neuralpix.dto.gemini.GeminiChatRequest;
import org.kh.neuralpix.dto.gemini.GeminiChatResponse;
import org.kh.neuralpix.service.GeminiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
public class GeminiServiceImpl implements GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiServiceImpl.class);

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String model;

    @Value("${gemini.timeout:30000}")
    private int timeout;
    
    @Value("${google.cloud.project-id}")
    private String projectId;
    
    @Value("${google.cloud.service-account-key}")
    private String serviceAccountKey;

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;

    // Gemini API endpoints
    private static final String GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final String GENERATE_CONTENT_ENDPOINT = ":generateContent";
    private static final String STREAM_GENERATE_CONTENT_ENDPOINT = ":streamGenerateContent";
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    public GeminiServiceImpl() {
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public CompletableFuture<GeminiChatResponse> sendChatMessage(GeminiChatRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Sending chat message to Gemini: {}", request.getMessage());

                Map<String, Object> requestBody = buildRequestBody(request);
                String jsonBody = objectMapper.writeValueAsString(requestBody);
                String url = GEMINI_BASE_URL + model + GENERATE_CONTENT_ENDPOINT + "?key=" + apiKey;
                

                RequestBody body = RequestBody.create(jsonBody, JSON);
                Request httpRequest = new Request.Builder()
                        .url(url)
                        .post(body)
                        .addHeader("Content-Type", "application/json")
                        .build();

                try (Response response = httpClient.newCall(httpRequest).execute()) {
                    if (response.isSuccessful() && response.body() != null) {
                        String responseBody = response.body().string();
                        return parseGeminiResponse(responseBody, request.getConversationId());
                    } else {
                        logger.error("Failed to get response from Gemini. Status: {}", response.code());
                        String errorBody = response.body() != null ? response.body().string() : "No error details";
                        logger.error("Error details: {}", errorBody);
                        return GeminiChatResponse.createErrorResponse(
                            request.getConversationId(), 
                            "Failed to get response from Gemini: " + response.code()
                        );
                    }
                }

            } catch (Exception e) {
                logger.error("Error sending message to Gemini: {}", e.getMessage(), e);
                return GeminiChatResponse.createErrorResponse(
                    request.getConversationId(),
                    "Error processing your message: " + e.getMessage()
                );
            }
        });
    }

    @Override
    public Flux<String> streamChatMessage(GeminiChatRequest request) {
        // Implementation for streaming would require WebClient for reactive programming
        // For now, return empty flux - can be implemented later if needed
        return Flux.empty();
    }

    @Override
    public CompletableFuture<GeminiChatResponse> generateImage(GeminiChatRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Generating image with Gemini + Google Imagen API for: {}", request.getMessage());
                
                // Step 1: Use Gemini to enhance the prompt
                String enhancementPrompt = "Create a detailed, artistic image generation prompt based on this request: '" + 
                    request.getMessage() + "'. Include specific details about:\n" +
                    "- Art style and visual aesthetic\n" +
                    "- Composition and framing\n" +
                    "- Lighting, colors, and mood\n" +
                    "- Textures and visual details\n" +
                    "Keep the enhanced prompt clear and under 300 characters for optimal image generation.";

                GeminiChatRequest promptRequest = GeminiChatRequest.builder()
                    .message(enhancementPrompt)
                    .conversationId(request.getConversationId())
                    .userId(request.getUserId())
                    .build();

                GeminiChatResponse promptResponse = sendChatMessage(promptRequest).join();
                
                if (!promptResponse.getMessageType().equals("TEXT") || promptResponse.getContent() == null) {
                    logger.warn("Failed to enhance prompt with Gemini, using original prompt");
                    return generateImageWithGoogleImagen(request.getMessage(), request).join();
                }

                String enhancedPrompt = promptResponse.getContent().trim();
                logger.info("Enhanced prompt: {}", enhancedPrompt);

                // Step 2: Use Google Imagen API to generate the actual image
                return generateImageWithGoogleImagen(enhancedPrompt, request).join();

            } catch (Exception e) {
                logger.error("Error in Gemini image generation: {}", e.getMessage(), e);
                return GeminiChatResponse.createErrorResponse(
                    request.getConversationId(),
                    "Sorry, I encountered an error while generating your image. Please try again."
                );
            }
        });
    }
    
    private CompletableFuture<GeminiChatResponse> generateImageWithGoogleImagen(String prompt, GeminiChatRequest originalRequest) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Generating image with Google Imagen API: {}", prompt);
                
                // Build Google Imagen API request
                Map<String, Object> requestBody = new HashMap<>();
                Map<String, Object> instances = new HashMap<>();
                instances.put("prompt", prompt);
                
                // Add image generation parameters
                Map<String, Object> parameters = new HashMap<>();
                parameters.put("sampleCount", 1);
                parameters.put("aspectRatio", originalRequest.getAspectRatio() != null ? originalRequest.getAspectRatio() : "1:1");
                parameters.put("safetyFilterLevel", "block_some");
                parameters.put("personGeneration", "allow_adult");
                
                requestBody.put("instances", Arrays.asList(instances));
                requestBody.put("parameters", parameters);
                
                String jsonBody = objectMapper.writeValueAsString(requestBody);
                
                // Google Imagen API endpoint
                String url = "https://us-central1-aiplatform.googleapis.com/v1/projects/" + projectId + "/locations/us-central1/publishers/google/models/imagegeneration:predict";
                
                RequestBody body = RequestBody.create(jsonBody, JSON);
                Request httpRequest = new Request.Builder()
                    .url(url)
                    .post(body)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Authorization", "Bearer " + getGoogleCloudAccessToken())
                    .build();

                try (Response response = httpClient.newCall(httpRequest).execute()) {
                    if (response.isSuccessful() && response.body() != null) {
                        String responseBody = response.body().string();
                        return parseImagenResponse(responseBody, originalRequest.getConversationId(), originalRequest.getMessage());
                    } else {
                        logger.error("Failed to generate image with Google Imagen. Status: {}", response.code());
                        String errorBody = response.body() != null ? response.body().string() : "No error details";
                        logger.error("Error details: {}", errorBody);
                        return GeminiChatResponse.createErrorResponse(
                            originalRequest.getConversationId(),
                            "Failed to generate image with Google Imagen API"
                        );
                    }
                }
                
            } catch (Exception e) {
                logger.error("Error generating image with Google Imagen: {}", e.getMessage(), e);
                return GeminiChatResponse.createErrorResponse(
                    originalRequest.getConversationId(),
                    "Error generating image: " + e.getMessage()
                );
            }
        });
    }
    
    private String getGoogleCloudAccessToken() {
        // This should be implemented to get Google Cloud access token
        // You can use Google Cloud SDK or service account credentials
        return "YOUR_ACCESS_TOKEN"; // Placeholder
    }
    
    private GeminiChatResponse parseImagenResponse(String responseBody, String conversationId, String originalMessage) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode predictions = root.get("predictions");
            
            if (predictions != null && predictions.isArray() && predictions.size() > 0) {
                List<String> imageUrls = new ArrayList<>();
                
                for (JsonNode prediction : predictions) {
                    JsonNode bytesBase64Encoded = prediction.get("bytesBase64Encoded");
                    if (bytesBase64Encoded != null) {
                        // Convert base64 to URL or save to storage
                        String base64Image = bytesBase64Encoded.asText();
                        String imageUrl = "data:image/png;base64," + base64Image;
                        imageUrls.add(imageUrl);
                    }
                }
                
                if (!imageUrls.isEmpty()) {
                    return GeminiChatResponse.builder()
                        .conversationId(conversationId)
                        .content("🎨 I've generated an image for you using Google Imagen! Here's what I created based on your request: \"" + 
                                originalMessage + "\"")
                        .messageType("IMAGE")
                        .generatedImages(imageUrls)
                        .timestamp(LocalDateTime.now())
                        .isComplete(true)
                        .build();
                }
            }
            
            logger.error("No images found in Google Imagen response: {}", responseBody);
            return GeminiChatResponse.createErrorResponse(conversationId, "No images generated");
            
        } catch (Exception e) {
            logger.error("Error parsing Google Imagen response: {}", e.getMessage(), e);
            return GeminiChatResponse.createErrorResponse(conversationId, "Failed to parse image response");
        }
    }

    @Override
    public CompletableFuture<GeminiChatResponse> analyzeImage(GeminiChatRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                if (request.getImages() == null || request.getImages().isEmpty()) {
                    return GeminiChatResponse.createErrorResponse(
                        request.getConversationId(),
                        "No images provided for analysis"
                    );
                }

                Map<String, Object> requestBody = buildMultiModalRequestBody(request);
                String jsonBody = objectMapper.writeValueAsString(requestBody);
                String url = GEMINI_BASE_URL + "gemini-1.5-flash" + GENERATE_CONTENT_ENDPOINT + "?key=" + apiKey;

                RequestBody body = RequestBody.create(jsonBody, JSON);
                Request httpRequest = new Request.Builder()
                        .url(url)
                        .post(body)
                        .addHeader("Content-Type", "application/json")
                        .build();

                try (Response response = httpClient.newCall(httpRequest).execute()) {
                    if (response.isSuccessful() && response.body() != null) {
                        String responseBody = response.body().string();
                        return parseGeminiResponse(responseBody, request.getConversationId());
                    } else {
                        logger.error("Failed to analyze image. Status: {}", response.code());
                        String errorBody = response.body() != null ? response.body().string() : "No error details";
                        logger.error("Error details: {}", errorBody);
                        return GeminiChatResponse.createErrorResponse(
                            request.getConversationId(),
                            "Failed to analyze image: " + response.code()
                        );
                    }
                }

            } catch (Exception e) {
                logger.error("Error analyzing image: {}", e.getMessage(), e);
                return GeminiChatResponse.createErrorResponse(
                    request.getConversationId(),
                    "Error analyzing image: " + e.getMessage()
                );
            }
        });
    }

    @Override
    public CompletableFuture<GeminiChatResponse> processMultiModal(GeminiChatRequest request) {
        return analyzeImage(request); // Same implementation for now
    }

    private Map<String, Object> buildRequestBody(GeminiChatRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
        
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        List<Map<String, Object>> parts = new ArrayList<>();
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", request.getMessage());
        parts.add(textPart);
        
        content.put("parts", parts);
        contents.add(content);
        
        requestBody.put("contents", contents);
        
        // Add generation config for better responses
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("topK", 40);
        generationConfig.put("topP", 0.95);
        generationConfig.put("maxOutputTokens", 1024);
        
        requestBody.put("generationConfig", generationConfig);
        
        return requestBody;
    }

    private Map<String, Object> buildMultiModalRequestBody(GeminiChatRequest request) {
        Map<String, Object> requestBody = new HashMap<>();
        
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> content = new HashMap<>();
        
        List<Map<String, Object>> parts = new ArrayList<>();
        
        // Add text part
        if (request.getMessage() != null && !request.getMessage().isEmpty()) {
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", request.getMessage());
            parts.add(textPart);
        }
        
        // Add image parts
        if (request.getImages() != null) {
            for (String imageBase64 : request.getImages()) {
                Map<String, Object> imagePart = new HashMap<>();
                Map<String, Object> inlineData = new HashMap<>();
                
                // Remove data:image/jpeg;base64, prefix if present
                String cleanBase64 = imageBase64.replaceFirst("^data:image/[^;]+;base64,", "");
                
                inlineData.put("mimeType", "image/jpeg");
                inlineData.put("data", cleanBase64);
                imagePart.put("inlineData", inlineData);
                parts.add(imagePart);
            }
        }
        
        content.put("parts", parts);
        contents.add(content);
        
        requestBody.put("contents", contents);
        
        return requestBody;
    }

    private GeminiChatResponse parseGeminiResponse(String responseBody, String conversationId) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.get("candidates");
            
            if (candidates != null && candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content = firstCandidate.get("content");
                
                if (content != null) {
                    JsonNode parts = content.get("parts");
                    if (parts != null && parts.isArray() && parts.size() > 0) {
                        JsonNode textPart = parts.get(0);
                        String text = textPart.get("text").asText();
                        
                        return GeminiChatResponse.createTextResponse(conversationId, text);
                    }
                }
            }
            
            // If we can't parse the response properly, return an error
            return GeminiChatResponse.createErrorResponse(
                conversationId,
                "Failed to parse Gemini response"
            );
            
        } catch (Exception e) {
            logger.error("Error parsing Gemini response: {}", e.getMessage(), e);
            return GeminiChatResponse.createErrorResponse(
                conversationId,
                "Error parsing response: " + e.getMessage()
            );
        }
    }
}