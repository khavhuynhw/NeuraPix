package org.kh.neuralpix.service;

import com.google.cloud.aiplatform.v1.PredictResponse;
import com.google.cloud.aiplatform.v1.PredictionServiceClient;
import com.google.protobuf.Struct;
import com.google.protobuf.Value;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.kh.neuralpix.config.VertexAIConfig;
import org.kh.neuralpix.dto.vertexai.VertexAIImageRequest;
import org.kh.neuralpix.dto.vertexai.VertexAIImageResponse;
import org.kh.neuralpix.service.impl.VertexAIImagenServiceImpl;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VertexAIImagenServiceTest {

    @Mock
    private PredictionServiceClient predictionServiceClient;

    @Mock
    private VertexAIConfig vertexAIConfig;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private VertexAIImagenServiceImpl vertexAIImagenService;

    private VertexAIImageRequest testRequest;

    @BeforeEach
    void setUp() {
        testRequest = VertexAIImageRequest.builder()
            .prompt("A beautiful sunset over mountains")
            .numberOfImages(1)
            .aspectRatio("1:1")
            .build();

        when(vertexAIConfig.getProjectId()).thenReturn("test-project");
        when(vertexAIConfig.getLocation()).thenReturn("us-central1");
    }

    @Test
    void testGenerateImage_Success() throws Exception {
        // Arrange
        PredictResponse mockResponse = createMockPredictResponse();
        when(predictionServiceClient.predict(any())).thenReturn(mockResponse);
        when(cloudinaryService.uploadImageFromBytes(any(), any())).thenReturn("http://test-url.com/image.png");

        // Act
        CompletableFuture<VertexAIImageResponse> future = vertexAIImagenService.generateImage(testRequest);
        VertexAIImageResponse response = future.get();

        // Assert
        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertNotNull(response.getImages());
        assertEquals(1, response.getImages().size());
        assertEquals("http://test-url.com/image.png", response.getImages().get(0).getImageUrl());

        verify(predictionServiceClient, times(1)).predict(any());
        verify(cloudinaryService, times(1)).uploadImageFromBytes(any(), any());
    }

    @Test
    void testGenerateImage_InvalidPrompt() {
        // Arrange
        VertexAIImageRequest invalidRequest = VertexAIImageRequest.builder()
            .prompt("")
            .build();

        // Act & Assert
        CompletableFuture<VertexAIImageResponse> future = vertexAIImagenService.generateImage(invalidRequest);
        
        assertDoesNotThrow(() -> {
            VertexAIImageResponse response = future.get();
            assertNotNull(response);
            // The service should handle validation at the controller level
        });
    }

    @Test
    void testGenerateImage_ServiceException() throws Exception {
        // Arrange
        when(predictionServiceClient.predict(any())).thenThrow(new RuntimeException("Service unavailable"));

        // Act
        CompletableFuture<VertexAIImageResponse> future = vertexAIImagenService.generateImage(testRequest);
        VertexAIImageResponse response = future.get();

        // Assert
        assertNotNull(response);
        assertFalse(response.isSuccess());
        assertNotNull(response.getErrorMessage());
        assertTrue(response.getErrorMessage().contains("Failed to generate image"));
    }

    @Test
    void testEditImage_Success() throws Exception {
        // Arrange
        VertexAIImageRequest editRequest = VertexAIImageRequest.builder()
            .prompt("Add more colors")
            .baseImage("base64encodedimage")
            .build();

        PredictResponse mockResponse = createMockPredictResponse();
        when(predictionServiceClient.predict(any())).thenReturn(mockResponse);
        when(cloudinaryService.uploadImageFromBytes(any(), any())).thenReturn("http://test-url.com/edited.png");

        // Act
        CompletableFuture<VertexAIImageResponse> future = vertexAIImagenService.editImage(editRequest);
        VertexAIImageResponse response = future.get();

        // Assert
        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("image-to-image", editRequest.getMode());
    }

    @Test
    void testUpscaleImage_Success() throws Exception {
        // Arrange
        VertexAIImageRequest upscaleRequest = VertexAIImageRequest.builder()
            .baseImage("base64encodedimage")
            .build();

        PredictResponse mockResponse = createMockPredictResponse();
        when(predictionServiceClient.predict(any())).thenReturn(mockResponse);
        when(cloudinaryService.uploadImageFromBytes(any(), any())).thenReturn("http://test-url.com/upscaled.png");

        // Act
        CompletableFuture<VertexAIImageResponse> future = vertexAIImagenService.upscaleImage(upscaleRequest);
        VertexAIImageResponse response = future.get();

        // Assert
        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("upscale", upscaleRequest.getMode());
    }

    @Test
    void testIsServiceAvailable_True() {
        // Arrange
        when(predictionServiceClient.toString()).thenReturn("MockClient");

        // Act
        boolean available = vertexAIImagenService.isServiceAvailable();

        // Assert
        assertTrue(available);
    }

    @Test
    void testGetAvailableModels() {
        // Act
        String[] models = vertexAIImagenService.getAvailableModels();

        // Assert
        assertNotNull(models);
        assertTrue(models.length > 0);
        assertEquals("imagegeneration@006", models[0]);
    }

    private PredictResponse createMockPredictResponse() {
        Struct.Builder structBuilder = Struct.newBuilder();
        structBuilder.putFields("bytesBase64Encoded", 
            Value.newBuilder().setStringValue("dGVzdGltYWdlZGF0YQ==").build());

        Value prediction = Value.newBuilder()
            .setStructValue(structBuilder.build())
            .build();

        return PredictResponse.newBuilder()
            .addPredictions(prediction)
            .build();
    }
}