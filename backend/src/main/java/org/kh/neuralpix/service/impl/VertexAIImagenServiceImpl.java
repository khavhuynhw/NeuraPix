package org.kh.neuralpix.service.impl;

import com.google.cloud.aiplatform.v1.EndpointName;
import com.google.cloud.aiplatform.v1.PredictRequest;
import com.google.cloud.aiplatform.v1.PredictResponse;
import com.google.cloud.aiplatform.v1.PredictionServiceClient;
import com.google.protobuf.Struct;
import com.google.protobuf.Value;
import com.google.protobuf.util.JsonFormat;
import org.kh.neuralpix.config.VertexAIConfig;
import org.kh.neuralpix.dto.vertexai.VertexAIImageRequest;
import org.kh.neuralpix.dto.vertexai.VertexAIImageResponse;
import org.kh.neuralpix.service.CloudinaryService;
import org.kh.neuralpix.service.VertexAIImagenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
public class VertexAIImagenServiceImpl implements VertexAIImagenService {
    
    private static final Logger logger = LoggerFactory.getLogger(VertexAIImagenServiceImpl.class);
    
    @Autowired
    private PredictionServiceClient predictionServiceClient;
    
    @Autowired
    private VertexAIConfig vertexAIConfig;
    
    @Autowired
    private CloudinaryService cloudinaryService;
    
    @org.springframework.beans.factory.annotation.Value("${vertexai.imagen.model:imagegeneration@006}")
    private String imagenModel;
    
    @org.springframework.beans.factory.annotation.Value("${vertexai.imagen.timeout:60000}")
    private long timeoutMs;
    
    @Override
    public CompletableFuture<VertexAIImageResponse> generateImage(VertexAIImageRequest request) {
        return generateImage(request, null);
    }
    
    @Override
    public CompletableFuture<VertexAIImageResponse> generateImage(VertexAIImageRequest request, Long userId) {
        return CompletableFuture.supplyAsync(() -> {
            String correlationId = java.util.UUID.randomUUID().toString().substring(0, 8);
            long startTime = System.currentTimeMillis();
            
            try {
                logger.info("[{}] Starting Vertex AI Imagen generation for prompt: {}", correlationId, request.getPrompt());
                
                // Build the prediction request
                PredictRequest predictRequest = buildPredictRequest(request);
                
                // Make the prediction
                PredictResponse response = predictionServiceClient.predict(predictRequest);
                
                // Process the response
                VertexAIImageResponse imageResponse = processResponse(response, correlationId);
                
                // Upload images to Cloudinary if successful
                if (imageResponse.isSuccess() && imageResponse.getImages() != null) {
                    uploadImagesToCloudinary(imageResponse, correlationId);
                }
                
                long processingTime = System.currentTimeMillis() - startTime;
                imageResponse.setProcessingTimeMs(processingTime);
                imageResponse.setRequestId(correlationId);
                
                logger.info("[{}] Vertex AI Imagen generation completed in {}ms", correlationId, processingTime);
                return imageResponse;
                
            } catch (Exception e) {
                logger.error("[{}] Error in Vertex AI Imagen generation: {}", correlationId, e.getMessage(), e);
                long processingTime = System.currentTimeMillis() - startTime;
                
                return VertexAIImageResponse.builder()
                    .success(false)
                    .errorMessage("Failed to generate image: " + e.getMessage())
                    .requestId(correlationId)
                    .processingTimeMs(processingTime)
                    .build();
            }
        });
    }
    
    @Override
    public CompletableFuture<VertexAIImageResponse> editImage(VertexAIImageRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            String correlationId = java.util.UUID.randomUUID().toString().substring(0, 8);
            long startTime = System.currentTimeMillis();
            
            try {
                logger.info("[{}] Starting Vertex AI Imagen image editing", correlationId);
                
                // Set mode for editing
                request.setMode("image-to-image");
                
                PredictRequest predictRequest = buildPredictRequest(request);
                PredictResponse response = predictionServiceClient.predict(predictRequest);
                
                VertexAIImageResponse imageResponse = processResponse(response, correlationId);
                
                if (imageResponse.isSuccess() && imageResponse.getImages() != null) {
                    uploadImagesToCloudinary(imageResponse, correlationId);
                }
                
                long processingTime = System.currentTimeMillis() - startTime;
                imageResponse.setProcessingTimeMs(processingTime);
                imageResponse.setRequestId(correlationId);
                
                logger.info("[{}] Vertex AI Imagen editing completed in {}ms", correlationId, processingTime);
                return imageResponse;
                
            } catch (Exception e) {
                logger.error("[{}] Error in Vertex AI Imagen editing: {}", correlationId, e.getMessage(), e);
                long processingTime = System.currentTimeMillis() - startTime;
                
                return VertexAIImageResponse.builder()
                    .success(false)
                    .errorMessage("Failed to edit image: " + e.getMessage())
                    .requestId(correlationId)
                    .processingTimeMs(processingTime)
                    .build();
            }
        });
    }
    
    @Override
    public CompletableFuture<VertexAIImageResponse> upscaleImage(VertexAIImageRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            String correlationId = java.util.UUID.randomUUID().toString().substring(0, 8);
            long startTime = System.currentTimeMillis();
            
            try {
                logger.info("[{}] Starting Vertex AI image upscaling", correlationId);
                
                // Set mode for upscaling
                request.setMode("upscale");
                
                PredictRequest predictRequest = buildPredictRequest(request);
                PredictResponse response = predictionServiceClient.predict(predictRequest);
                
                VertexAIImageResponse imageResponse = processResponse(response, correlationId);
                
                if (imageResponse.isSuccess() && imageResponse.getImages() != null) {
                    uploadImagesToCloudinary(imageResponse, correlationId);
                }
                
                long processingTime = System.currentTimeMillis() - startTime;
                imageResponse.setProcessingTimeMs(processingTime);
                imageResponse.setRequestId(correlationId);
                
                logger.info("[{}] Vertex AI upscaling completed in {}ms", correlationId, processingTime);
                return imageResponse;
                
            } catch (Exception e) {
                logger.error("[{}] Error in Vertex AI upscaling: {}", correlationId, e.getMessage(), e);
                long processingTime = System.currentTimeMillis() - startTime;
                
                return VertexAIImageResponse.builder()
                    .success(false)
                    .errorMessage("Failed to upscale image: " + e.getMessage())
                    .requestId(correlationId)
                    .processingTimeMs(processingTime)
                    .build();
            }
        });
    }
    
    @Override
    public boolean isServiceAvailable() {
        try {
            // Simple health check - try to create a minimal request
            return predictionServiceClient != null;
        } catch (Exception e) {
            logger.warn("Vertex AI service is not available: {}", e.getMessage());
            return false;
        }
    }
    
    @Override
    public String[] getAvailableModels() {
        return new String[]{"imagegeneration@006", "imagegeneration@005", "imagegeneration@002"};
    }
    
    private PredictRequest buildPredictRequest(VertexAIImageRequest request) {
        String projectId = vertexAIConfig.getProjectId();
        String location = vertexAIConfig.getLocation();
        
        // Construct the correct endpoint for Vertex AI Imagen model
        String endpointPath = String.format("projects/%s/locations/%s/publishers/google/models/%s", 
            projectId, location, vertexAIConfig.getImagenModel());
        EndpointName endpointName = EndpointName.parse(endpointPath);
        
        // Build instances
        Struct.Builder instanceBuilder = Struct.newBuilder();
        instanceBuilder.putFields("prompt", Value.newBuilder().setStringValue(request.getPrompt()).build());
        
        if (request.getNegativePrompt() != null) {
            instanceBuilder.putFields("negative_prompt", Value.newBuilder().setStringValue(request.getNegativePrompt()).build());
        }
        
        if (request.getNumberOfImages() != null) {
            instanceBuilder.putFields("sampleCount", Value.newBuilder().setNumberValue(request.getNumberOfImages()).build());
        }
        
        if (request.getAspectRatio() != null) {
            instanceBuilder.putFields("aspectRatio", Value.newBuilder().setStringValue(request.getAspectRatio()).build());
        }
        
        if (request.getSeed() != null) {
            instanceBuilder.putFields("seed", Value.newBuilder().setNumberValue(request.getSeed()).build());
        }
        
        if (request.getGuidanceScale() != null) {
            instanceBuilder.putFields("guidanceScale", Value.newBuilder().setStringValue(request.getGuidanceScale()).build());
        }
        
        if (request.getBaseImage() != null) {
            Struct.Builder imageBuilder = Struct.newBuilder();
            imageBuilder.putFields("bytesBase64Encoded", Value.newBuilder().setStringValue(request.getBaseImage()).build());
            instanceBuilder.putFields("image", Value.newBuilder().setStructValue(imageBuilder.build()).build());
        }
        
        if (request.getMaskImage() != null) {
            Struct.Builder maskBuilder = Struct.newBuilder();
            maskBuilder.putFields("bytesBase64Encoded", Value.newBuilder().setStringValue(request.getMaskImage()).build());
            instanceBuilder.putFields("mask", Value.newBuilder().setStructValue(maskBuilder.build()).build());
        }
        
        // Build parameters
        Struct.Builder parametersBuilder = Struct.newBuilder();
        parametersBuilder.putFields("sampleCount", Value.newBuilder().setNumberValue(request.getNumberOfImages() != null ? request.getNumberOfImages() : 1).build());
        
        if (request.getLanguage() != null) {
            parametersBuilder.putFields("language", Value.newBuilder().setStringValue(request.getLanguage()).build());
        }
        
        if (request.getAddWatermark() != null) {
            parametersBuilder.putFields("addWatermark", Value.newBuilder().setBoolValue(request.getAddWatermark()).build());
        }
        
        if (request.getSafetyFilterLevel() != null) {
            parametersBuilder.putFields("safetyFilterLevel", Value.newBuilder().setStringValue(request.getSafetyFilterLevel()).build());
        }
        
        if (request.getPersonGeneration() != null) {
            parametersBuilder.putFields("personGeneration", Value.newBuilder().setStringValue(request.getPersonGeneration()).build());
        }
        
        return PredictRequest.newBuilder()
            .setEndpoint(endpointName.toString())
            .addInstances(Value.newBuilder().setStructValue(instanceBuilder.build()).build())
            .setParameters(Value.newBuilder().setStructValue(parametersBuilder.build()).build())
            .build();
    }
    
    private VertexAIImageResponse processResponse(PredictResponse response, String correlationId) {
        try {
            List<VertexAIImageResponse.GeneratedImageData> images = new ArrayList<>();
            
            for (Value prediction : response.getPredictionsList()) {
                Struct predictionStruct = prediction.getStructValue();
                
                if (predictionStruct.containsFields("bytesBase64Encoded")) {
                    String base64Data = predictionStruct.getFieldsMap().get("bytesBase64Encoded").getStringValue();
                    
                    VertexAIImageResponse.GeneratedImageData imageData = VertexAIImageResponse.GeneratedImageData.builder()
                        .base64Data(base64Data)
                        .format("PNG")
                        .build();
                    
                    images.add(imageData);
                }
            }
            
            if (images.isEmpty()) {
                logger.warn("[{}] No images found in Vertex AI response", correlationId);
                return VertexAIImageResponse.builder()
                    .success(false)
                    .errorMessage("No images generated")
                    .build();
            }
            
            return VertexAIImageResponse.builder()
                .success(true)
                .images(images)
                .build();
                
        } catch (Exception e) {
            logger.error("[{}] Error processing Vertex AI response: {}", correlationId, e.getMessage(), e);
            return VertexAIImageResponse.builder()
                .success(false)
                .errorMessage("Error processing response: " + e.getMessage())
                .build();
        }
    }
    
    private void uploadImagesToCloudinary(VertexAIImageResponse response, String correlationId) {
        try {
            for (VertexAIImageResponse.GeneratedImageData imageData : response.getImages()) {
                if (imageData.getBase64Data() != null) {
                    // Convert base64 to bytes
                    byte[] imageBytes = Base64.getDecoder().decode(imageData.getBase64Data());
                    
                    // Upload to Cloudinary
                    String imageUrl = cloudinaryService.uploadImageFromBytes(imageBytes, "vertexai_" + correlationId);
                    imageData.setImageUrl(imageUrl);
                    
                    // Clear base64 data to save memory
                    imageData.setBase64Data(null);
                    
                    logger.info("[{}] Uploaded image to Cloudinary: {}", correlationId, imageUrl);
                }
            }
        } catch (Exception e) {
            logger.error("[{}] Error uploading images to Cloudinary: {}", correlationId, e.getMessage(), e);
        }
    }
}