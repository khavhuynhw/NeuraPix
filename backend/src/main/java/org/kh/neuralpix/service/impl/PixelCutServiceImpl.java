package org.kh.neuralpix.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.kh.neuralpix.dto.pixelcut.PixelCutImageGenerationRequest;
import org.kh.neuralpix.dto.pixelcut.PixelCutImageGenerationResponse;
import org.kh.neuralpix.model.Prompt;
import org.kh.neuralpix.service.PixelCutService;
import org.kh.neuralpix.service.CloudinaryService;
import org.kh.neuralpix.service.ProcessedImageService;
import org.kh.neuralpix.model.ProcessedImage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.Map;
import java.util.HashMap;
import java.util.Base64;
import java.util.List;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;

@Service
public class PixelCutServiceImpl implements PixelCutService {

    private static final Logger logger = LoggerFactory.getLogger(PixelCutServiceImpl.class);

    @Value("${pixelcut.api-key}")
    private String apiKey;

    @Value("${pixelcut.base-url}")
    private String baseUrl;

    @Value("${pixelcut.timeout:30000}")
    private int timeout;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private OkHttpClient okHttpClient;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private ProcessedImageService processedImageService;

    public PixelCutServiceImpl() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        // OkHttp client initialized lazily with default timeouts; rebuilt when timeout value is available
        this.okHttpClient = new OkHttpClient();
    }

    private OkHttpClient getOkHttpClient() {
        // Rebuild client if timeout property is set and differs
        if (okHttpClient == null) {
            okHttpClient = new OkHttpClient();
        }
        return okHttpClient.newBuilder()
                .connectTimeout(timeout, TimeUnit.MILLISECONDS)
                .readTimeout(timeout, TimeUnit.MILLISECONDS)
                .writeTimeout(timeout, TimeUnit.MILLISECONDS)
                .build();
    }

    @Override
    public CompletableFuture<PixelCutImageGenerationResponse> generateImage(PixelCutImageGenerationRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Sending image generation request to PixelCut.ai: {}", request.getPrompt());
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Bearer " + apiKey);
                headers.set("X-API-KEY", apiKey);

                HttpEntity<PixelCutImageGenerationRequest> entity = new HttpEntity<>(request, headers);
                
                String url = baseUrl + "/generate";
                
                ResponseEntity<PixelCutImageGenerationResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    PixelCutImageGenerationResponse.class
                );

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    logger.info("Successfully received response from PixelCut.ai for prompt: {}", request.getPrompt());
                    return response.getBody();
                } else {
                    logger.error("Failed to generate image. Status: {}", response.getStatusCode());
                    throw new RuntimeException("Failed to generate image. Status: " + response.getStatusCode());
                }

            } catch (ResourceAccessException e) {
                logger.error("Timeout or connection error while generating image: {}", e.getMessage());
                throw new RuntimeException("Timeout or connection error while generating image", e);
            } catch (Exception e) {
                logger.error("Error generating image with PixelCut.ai: {}", e.getMessage(), e);
                throw new RuntimeException("Error generating image", e);
            }
        });
    }

    @Override
    public CompletableFuture<PixelCutImageGenerationResponse> upScale(PixelCutImageGenerationRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Upscaling image using PixelCut.ai");

                String imageUrl = request.getImageUrl();
                if (imageUrl == null || imageUrl.trim().isEmpty()) {
                    return PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Invalid or empty image URL")
                        .build();
                }
                
                // Convert to supported format if needed
                imageUrl = convertToSupportedFormat(imageUrl);

                OkHttpClient client = getOkHttpClient();
                
                // For base64 images, upload to Cloudinary first
                if (imageUrl.startsWith("data:image/")) {
                    logger.info("Uploading base64 image to Cloudinary for upscaling");
                    String cloudUrl = cloudinaryService.uploadImageFromBase64(imageUrl).join();
                    imageUrl = cloudUrl; // Use Cloudinary URL instead of base64
                }

                // Always send as JSON with image_url parameter
                logger.info("Processing image URL for upscaling: {}", imageUrl);
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("image_url", imageUrl);
                
                // PixelCut upscale API uses 'scale' parameter with integer values 2 or 4
                int scale = 2; // Default scale
                if (request.getScale() != null) {
                    double scaleValue = request.getScale().doubleValue();
                    if (scaleValue >= 4.0) {
                        scale = 4;
                    } else if (scaleValue >= 2.0) {
                        scale = 2;
                    }
                }
                requestBody.put("scale", scale);
                
                logger.info("Upscaling with scale factor: {}x", scale);
                
                RequestBody body;
                try {
                    String json = objectMapper.writeValueAsString(requestBody);
                    body = RequestBody.create(json, okhttp3.MediaType.parse("application/json"));
                } catch (Exception ex) {
                    logger.error("Failed to serialize upscale request: {}", ex.getMessage(), ex);
                    return PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Failed to serialize request data")
                        .build();
                }

                Request httpRequest = new Request.Builder()
                    .url(baseUrl + "/upscale")
                    .addHeader("X-API-KEY", apiKey)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Accept", "application/json")
                    .post(body)
                    .build();

                try (Response httpResponse = client.newCall(httpRequest).execute()) {
                    int code = httpResponse.code();
                    String responseBody = httpResponse.body() != null ? httpResponse.body().string() : null;

                    if (code >= 200 && code < 300 && responseBody != null) {
                        logger.info("PixelCut Upscale API Response: {}", responseBody);
                        
                        try {
                            // Parse the response to get result_url
                            Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
                            String resultUrl = (String) responseMap.get("result_url");
                            
                            if (resultUrl != null) {
                                PixelCutImageGenerationResponse result = PixelCutImageGenerationResponse.builder()
                                    .success(true)
                                    .imageUrls(List.of(resultUrl))
                                    .build();
                                logger.info("Successfully upscaled image");
                                return result;
                            } else {
                                logger.error("No result_url in upscale response: {}", responseBody);
                                return PixelCutImageGenerationResponse.builder()
                                    .success(false)
                                    .errorMessage("Invalid response from PixelCut API - no result URL")
                                    .build();
                            }
                        } catch (Exception parseEx) {
                            logger.error("Failed to parse PixelCut upscale response: {}", parseEx.getMessage());
                            return PixelCutImageGenerationResponse.builder()
                                .success(false)
                                .errorMessage("Failed to parse PixelCut API response")
                                .build();
                        }
                    }

                    logger.error("Failed to upscale image. HTTP {} Response: {}", code, responseBody);
                    return PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("PixelCut API error: HTTP " + code + (responseBody != null ? " - " + responseBody : ""))
                        .build();
                }

            } catch (Exception e) {
                logger.error("Error upscaling image: {}", e.getMessage(), e);
                return PixelCutImageGenerationResponse.builder()
                    .success(false)
                    .errorMessage("Failed to upscale image: " + e.getMessage())
                    .build();
            }
        });
    }

    private CompletableFuture<String> ensureDirectImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return CompletableFuture.completedFuture(null);
        }

        // If it's already a direct URL (http/https), use it
        if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            return CompletableFuture.completedFuture(imageUrl);
        }

        // If it's base64, upload to Cloudinary first
        if (imageUrl.startsWith("data:image/")) {
            return cloudinaryService.uploadImageFromBase64(imageUrl);
        }

        // Default case - try to use as is
        return CompletableFuture.completedFuture(imageUrl);
    }

    private void saveProcessedImageRecord(Long userId, String originalUrl, String processedUrl, String imgurUrl, 
                                        ProcessedImage.OperationType operationType, PixelCutImageGenerationRequest request, 
                                        boolean success, String errorMessage, long processingTime) {
        try {
            ProcessedImage processedImage = ProcessedImage.builder()
                .userId(userId)
                .originalUrl(originalUrl)
                .processedUrl(processedUrl)
                .imgurUrl(imgurUrl) // Can rename this to cloudinaryUrl later
                .operationType(operationType)
                .prompt(request.getPrompt())
                .style(request.getStyle())
                .quality(request.getQuality())
                .scaleFactor(request.getScale() != null ? request.getScale().doubleValue() : null)
                .processingTimeMs(processingTime)
                .success(success)
                .errorMessage(errorMessage)
                .isPublic(false)
                .isFavorite(false)
                .viewCount(0)
                .build();

            processedImageService.saveProcessedImage(processedImage);
        } catch (Exception e) {
            logger.warn("Failed to save processed image record: {}", e.getMessage());
            // Don't throw exception - this shouldn't break the main operation
        }
    }

    private boolean isValidImageFormat(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            logger.warn("Image URL is null or empty");
            return false;
        }
        
        if (imageUrl.startsWith("data:image/")) {
            // Extract MIME type from data URL
            try {
                String mimeType = imageUrl.substring(5, imageUrl.indexOf(';'));
                logger.debug("Detected MIME type: {}", mimeType);
                boolean isValid = mimeType.equals("image/jpeg") || mimeType.equals("image/png") || 
                       mimeType.equals("image/jpg") || mimeType.equals("image/webp");
                if (!isValid) {
                    logger.warn("Unsupported MIME type: {}", mimeType);
                }
                return isValid;
            } catch (Exception e) {
                logger.error("Failed to extract MIME type from data URL: {}", e.getMessage());
                return false;
            }
        }
        
        // For regular URLs, check file extension
        String lowerUrl = imageUrl.toLowerCase();
        boolean isValid = lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg") || 
               lowerUrl.endsWith(".png") || lowerUrl.endsWith(".webp");
        
        if (!isValid) {
            logger.warn("Unsupported image format detected from URL: {}", imageUrl);
        }
        
        return isValid;
    }

    private String convertToSupportedFormat(String imageUrl) {
        if (isValidImageFormat(imageUrl)) {
            return imageUrl;
        }

        if (!imageUrl.startsWith("data:image/")) {
            logger.warn("Cannot convert non-base64 image URL to supported format: {}", imageUrl);
            return imageUrl;
        }

        try {
            logger.info("Converting unsupported image format to PNG");
            
            // Extract base64 data
            String base64Data = imageUrl.substring(imageUrl.indexOf(',') + 1);
            byte[] imageBytes = Base64.getDecoder().decode(base64Data);
            
            // Read the image
            BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (originalImage == null) {
                throw new RuntimeException("Failed to read image data");
            }
            
            // Convert to PNG
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(originalImage, "png", baos);
            
            // Encode back to base64
            String convertedBase64 = Base64.getEncoder().encodeToString(baos.toByteArray());
            String convertedDataUrl = "data:image/png;base64," + convertedBase64;
            
            logger.info("Successfully converted image to PNG format");
            return convertedDataUrl;
            
        } catch (Exception e) {
            logger.error("Failed to convert image format: {}", e.getMessage(), e);
            throw new RuntimeException("Unable to convert image to supported format", e);
        }
    }

    @Override
    public CompletableFuture<PixelCutImageGenerationResponse> removeBackground(PixelCutImageGenerationRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Removing background from image using PixelCut.ai");

                String imageUrl = request.getImageUrl();
                if (imageUrl == null || imageUrl.trim().isEmpty()) {
                    return PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Invalid or empty image URL")
                        .build();
                }
                
                // Convert to supported format if needed
                imageUrl = convertToSupportedFormat(imageUrl);

                OkHttpClient client = getOkHttpClient();
                RequestBody body;

                // For base64 images, convert to supported format but keep as base64
                // For URL images, send directly as URL
                if (imageUrl.startsWith("data:image/")) {
                    logger.info("Uploading base64 image to Cloudinary for background removal");
                    String cloudUrl = cloudinaryService.uploadImageFromBase64(imageUrl).join();
                    imageUrl = cloudUrl; // Use Cloudinary URL instead of base64
                }

                // Always send as JSON with image_url parameter
                logger.info("Processing image URL for background removal: {}", imageUrl);
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("image_url", imageUrl);
                requestBody.put("format", "png");
                
                try {
                    String json = objectMapper.writeValueAsString(requestBody);
                    body = RequestBody.create(json, okhttp3.MediaType.parse("application/json"));
                } catch (Exception ex) {
                    logger.error("Failed to serialize remove-background request: {}", ex.getMessage(), ex);
                    return PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Failed to serialize request data")
                        .build();
                }

                Request httpRequest = new Request.Builder()
                    .url(baseUrl + "/remove-background")
                    .addHeader("X-API-KEY", apiKey)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Accept", "application/json")
                    .post(body)
                    .build();

                try (Response httpResponse = client.newCall(httpRequest).execute()) {
                    int code = httpResponse.code();
                    String contentType = httpResponse.header("Content-Type", "");

                    if (code >= 200 && code < 300 && httpResponse.body() != null) {
                        String responseBody = httpResponse.body().string();
                        logger.info("PixelCut API Response: {}", responseBody);
                        
                        try {
                            // Parse the response to get result_url
                            Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
                            String resultUrl = (String) responseMap.get("result_url");
                            
                            if (resultUrl != null) {
                                PixelCutImageGenerationResponse result = PixelCutImageGenerationResponse.builder()
                                    .success(true)
                                    .imageUrls(List.of(resultUrl))
                                    .build();
                                logger.info("Successfully removed background from image");
                                return result;
                            } else {
                                logger.error("No result_url in response: {}", responseBody);
                                return PixelCutImageGenerationResponse.builder()
                                    .success(false)
                                    .errorMessage("Invalid response from PixelCut API - no result URL")
                                    .build();
                            }
                        } catch (Exception parseEx) {
                            logger.error("Failed to parse PixelCut response: {}", parseEx.getMessage());
                            return PixelCutImageGenerationResponse.builder()
                                .success(false)
                                .errorMessage("Failed to parse PixelCut API response")
                                .build();
                        }
                    }

                    // Non-2xx
                    String errorBody = httpResponse.body() != null ? httpResponse.body().string() : null;
                    logger.error("Failed to remove background. HTTP {} Response: {}", code, errorBody);
                    
                    return PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("PixelCut API error: HTTP " + code + (errorBody != null ? " - " + errorBody : ""))
                        .build();
                }

            } catch (Exception e) {
                logger.error("Error removing background: {}", e.getMessage(), e);
                // Return error response instead of throwing exception
                return PixelCutImageGenerationResponse.builder()
                    .success(false)
                    .errorMessage("Failed to remove background: " + e.getMessage())
                    .build();
            }
        });
    }
    @Override
    public CompletableFuture<PixelCutImageGenerationResponse> generateBackground(PixelCutImageGenerationRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Generating background for image using PixelCut.ai with prompt: {}", request.getPrompt());

                String imageUrl = request.getImageUrl();
                if (imageUrl == null || imageUrl.trim().isEmpty()) {
                    return PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Invalid or empty image URL")
                        .build();
                }
                
                // Convert to supported format if needed
                imageUrl = convertToSupportedFormat(imageUrl);

                OkHttpClient client = getOkHttpClient();
                
                // For base64 images, upload to Cloudinary first
                if (imageUrl.startsWith("data:image/")) {
                    logger.info("Uploading base64 image to Cloudinary for background generation");
                    String cloudUrl = cloudinaryService.uploadImageFromBase64(imageUrl).join();
                    imageUrl = cloudUrl; // Use Cloudinary URL instead of base64
                }

                // Always send as JSON with image_url parameter
                logger.info("Processing image URL for background generation: {}", imageUrl);
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("image_url", imageUrl);
                requestBody.put("prompt", request.getPrompt());
                requestBody.put("style", request.getStyle() != null ? request.getStyle() : "realistic");
                requestBody.put("quality", request.getQuality() != null ? request.getQuality() : "high");
                
                RequestBody body;
                try {
                    String json = objectMapper.writeValueAsString(requestBody);
                    body = RequestBody.create(json, okhttp3.MediaType.parse("application/json"));
                } catch (Exception ex) {
                    logger.error("Failed to serialize generate-background request: {}", ex.getMessage(), ex);
                    return PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("Failed to serialize request data")
                        .build();
                }

                Request httpRequest = new Request.Builder()
                    .url(baseUrl + "/generate-background")
                    .addHeader("X-API-KEY", apiKey)
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Accept", "application/json")
                    .post(body)
                    .build();

                try (Response httpResponse = client.newCall(httpRequest).execute()) {
                    int code = httpResponse.code();
                    String responseBody = httpResponse.body() != null ? httpResponse.body().string() : null;

                    if (code >= 200 && code < 300 && responseBody != null) {
                        logger.info("PixelCut Generate Background API Response: {}", responseBody);
                        
                        try {
                            // Parse the response to get result_url
                            Map<String, Object> responseMap = objectMapper.readValue(responseBody, Map.class);
                            String resultUrl = (String) responseMap.get("result_url");
                            
                            if (resultUrl != null) {
                                PixelCutImageGenerationResponse result = PixelCutImageGenerationResponse.builder()
                                    .success(true)
                                    .imageUrls(List.of(resultUrl))
                                    .build();
                                logger.info("Successfully generated background for image");
                                return result;
                            } else {
                                logger.error("No result_url in generate background response: {}", responseBody);
                                return PixelCutImageGenerationResponse.builder()
                                    .success(false)
                                    .errorMessage("Invalid response from PixelCut API - no result URL")
                                    .build();
                            }
                        } catch (Exception parseEx) {
                            logger.error("Failed to parse PixelCut generate background response: {}", parseEx.getMessage());
                            return PixelCutImageGenerationResponse.builder()
                                .success(false)
                                .errorMessage("Failed to parse PixelCut API response")
                                .build();
                        }
                    }

                    logger.error("Failed to generate background. HTTP {} Response: {}", code, responseBody);
                    return PixelCutImageGenerationResponse.builder()
                        .success(false)
                        .errorMessage("PixelCut API error: HTTP " + code + (responseBody != null ? " - " + responseBody : ""))
                        .build();
                }

            } catch (Exception e) {
                logger.error("Error generating background: {}", e.getMessage(), e);
                return PixelCutImageGenerationResponse.builder()
                    .success(false)
                    .errorMessage("Failed to generate background: " + e.getMessage())
                    .build();
            }
        });
    }

    @Override
    public CompletableFuture<PixelCutImageGenerationResponse> generateImageFromPrompt(Prompt prompt) {
        PixelCutImageGenerationRequest request = PixelCutImageGenerationRequest.builder()
            .prompt(prompt.getPromptText())
            .negativePrompt(prompt.getNegativePrompt())
            .model(prompt.getModel())
            .width(prompt.getWidth())
            .height(prompt.getHeight())
            .steps(prompt.getSteps())
            .scale(prompt.getGuidanceScale())
            .seed(prompt.getSeed())
            .style(prompt.getStyle())
            .numImages(1)
            .quality("high")
            .format("png")
            .build();

        return generateImage(request);
    }

    @Override
    public String checkGenerationStatus(String taskId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("X-API-Key", apiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            String url = baseUrl + "/v1/status/" + taskId;
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                logger.error("Failed to check status. Status: {}", response.getStatusCode());
                return "unknown";
            }

        } catch (Exception e) {
            logger.error("Error checking generation status: {}", e.getMessage(), e);
            return "error";
        }
    }

    @Override
    public String[] getAvailableModels() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("X-API-Key", apiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            String url = baseUrl + "/v1/models";
            
            ResponseEntity<String[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            } else {
                logger.error("Failed to get models. Status: {}", response.getStatusCode());
                return new String[]{"stable-diffusion", "dall-e", "midjourney"};
            }

        } catch (Exception e) {
            logger.error("Error getting available models: {}", e.getMessage(), e);
            return new String[]{"stable-diffusion", "dall-e", "midjourney"};
        }
    }

    @Override
    public String[] getAvailableStyles() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("X-API-Key", apiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            String url = baseUrl + "/v1/styles";
            
            ResponseEntity<String[]> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String[].class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody();
            } else {
                logger.error("Failed to get styles. Status: {}", response.getStatusCode());
                return new String[]{"realistic", "artistic", "cartoon", "anime", "photographic"};
            }

        } catch (Exception e) {
            logger.error("Error getting available styles: {}", e.getMessage(), e);
            return new String[]{"realistic", "artistic", "cartoon", "anime", "photographic"};
        }
    }

    // Methods with user tracking
    @Override
    public CompletableFuture<PixelCutImageGenerationResponse> removeBackground(PixelCutImageGenerationRequest request, Long userId) {
        long startTime = System.currentTimeMillis();
        return removeBackground(request).whenComplete((response, throwable) -> {
            long processingTime = System.currentTimeMillis() - startTime;
            String cloudinaryUrl = null;
            
            try {
                // Get the Cloudinary URL from the uploaded image
                String directImageUrl = ensureDirectImageUrl(request.getImageUrl()).join();
                if (directImageUrl != null && directImageUrl.contains("cloudinary.com")) {
                    cloudinaryUrl = directImageUrl;
                }
            } catch (Exception e) {
                logger.warn("Could not determine Cloudinary URL: {}", e.getMessage());
            }
            
            saveProcessedImageRecord(
                userId,
                request.getImageUrl(),
                response != null && response.getImageUrls() != null && !response.getImageUrls().isEmpty() 
                    ? response.getImageUrls().get(0) : null,
                cloudinaryUrl,
                ProcessedImage.OperationType.REMOVE_BACKGROUND,
                request,
                response != null && response.isSuccess(),
                throwable != null ? throwable.getMessage() : (response != null ? response.getErrorMessage() : null),
                processingTime
            );
        });
    }

    @Override
    public CompletableFuture<PixelCutImageGenerationResponse> generateBackground(PixelCutImageGenerationRequest request, Long userId) {
        long startTime = System.currentTimeMillis();
        return generateBackground(request).whenComplete((response, throwable) -> {
            long processingTime = System.currentTimeMillis() - startTime;
            String cloudinaryUrl = null;
            
            try {
                String directImageUrl = ensureDirectImageUrl(request.getImageUrl()).join();
                if (directImageUrl != null && directImageUrl.contains("cloudinary.com")) {
                    cloudinaryUrl = directImageUrl;
                }
            } catch (Exception e) {
                logger.warn("Could not determine Cloudinary URL: {}", e.getMessage());
            }
            
            saveProcessedImageRecord(
                userId,
                request.getImageUrl(),
                response != null && response.getImageUrls() != null && !response.getImageUrls().isEmpty() 
                    ? response.getImageUrls().get(0) : null,
                cloudinaryUrl,
                ProcessedImage.OperationType.GENERATE_BACKGROUND,
                request,
                response != null && response.isSuccess(),
                throwable != null ? throwable.getMessage() : (response != null ? response.getErrorMessage() : null),
                processingTime
            );
        });
    }

    @Override
    public CompletableFuture<PixelCutImageGenerationResponse> upScale(PixelCutImageGenerationRequest request, Long userId) {
        long startTime = System.currentTimeMillis();
        return upScale(request).whenComplete((response, throwable) -> {
            long processingTime = System.currentTimeMillis() - startTime;
            String cloudinaryUrl = null;
            
            try {
                String directImageUrl = ensureDirectImageUrl(request.getImageUrl()).join();
                if (directImageUrl != null && directImageUrl.contains("cloudinary.com")) {
                    cloudinaryUrl = directImageUrl;
                }
            } catch (Exception e) {
                logger.warn("Could not determine Cloudinary URL: {}", e.getMessage());
            }
            
            saveProcessedImageRecord(
                userId,
                request.getImageUrl(),
                response != null && response.getImageUrls() != null && !response.getImageUrls().isEmpty() 
                    ? response.getImageUrls().get(0) : null,
                cloudinaryUrl,
                ProcessedImage.OperationType.UPSCALE_IMAGE,
                request,
                response != null && response.isSuccess(),
                throwable != null ? throwable.getMessage() : (response != null ? response.getErrorMessage() : null),
                processingTime
            );
        });
    }

    @Override
    public CompletableFuture<PixelCutImageGenerationResponse> generateImage(PixelCutImageGenerationRequest request, Long userId) {
        long startTime = System.currentTimeMillis();
        return generateImage(request).whenComplete((response, throwable) -> {
            long processingTime = System.currentTimeMillis() - startTime;
            
            saveProcessedImageRecord(
                userId,
                null, // No original image for generation
                response != null && response.getImageUrls() != null && !response.getImageUrls().isEmpty() 
                    ? response.getImageUrls().get(0) : null,
                null, // No Cloudinary upload needed for generation
                ProcessedImage.OperationType.GENERATE_IMAGE,
                request,
                response != null && response.isSuccess(),
                throwable != null ? throwable.getMessage() : (response != null ? response.getErrorMessage() : null),
                processingTime
            );
        });
    }
} 