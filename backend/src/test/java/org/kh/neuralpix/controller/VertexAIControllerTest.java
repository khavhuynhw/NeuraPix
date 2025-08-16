package org.kh.neuralpix.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.kh.neuralpix.dto.vertexai.VertexAIImageRequest;
import org.kh.neuralpix.dto.vertexai.VertexAIImageResponse;
import org.kh.neuralpix.service.GeneratedImageService;
import org.kh.neuralpix.service.UsageTrackingService;
import org.kh.neuralpix.service.UserService;
import org.kh.neuralpix.service.VertexAIImagenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.concurrent.CompletableFuture;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VertexAIController.class)
class VertexAIControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VertexAIImagenService vertexAIImagenService;

    @MockBean
    private UsageTrackingService usageTrackingService;

    @MockBean
    private GeneratedImageService generatedImageService;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private VertexAIImageRequest testRequest;
    private VertexAIImageResponse successResponse;

    @BeforeEach
    void setUp() {
        testRequest = VertexAIImageRequest.builder()
            .prompt("A beautiful landscape")
            .numberOfImages(1)
            .aspectRatio("1:1")
            .build();

        VertexAIImageResponse.GeneratedImageData imageData = VertexAIImageResponse.GeneratedImageData.builder()
            .imageUrl("http://test-url.com/image.png")
            .format("PNG")
            .build();

        successResponse = VertexAIImageResponse.builder()
            .success(true)
            .images(Arrays.asList(imageData))
            .requestId("test-123")
            .processingTimeMs(2000L)
            .build();
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testGenerateImage_Success() throws Exception {
        // Arrange
        when(usageTrackingService.canProcessImage("test@example.com")).thenReturn(true);
        when(vertexAIImagenService.generateImage(any(VertexAIImageRequest.class)))
            .thenReturn(CompletableFuture.completedFuture(successResponse));

        // Act & Assert
        mockMvc.perform(post("/api/vertexai/generate-image")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.images").isArray())
                .andExpect(jsonPath("$.images[0].imageUrl").value("http://test-url.com/image.png"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testGenerateImage_UsageLimitExceeded() throws Exception {
        // Arrange
        when(usageTrackingService.canProcessImage("test@example.com")).thenReturn(false);

        // Act & Assert
        mockMvc.perform(post("/api/vertexai/generate-image")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorMessage").value(org.hamcrest.Matchers.containsString("usage limit")));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testGenerateImage_EmptyPrompt() throws Exception {
        // Arrange
        VertexAIImageRequest invalidRequest = VertexAIImageRequest.builder()
            .prompt("")
            .build();

        when(usageTrackingService.canProcessImage("test@example.com")).thenReturn(true);

        // Act & Assert
        mockMvc.perform(post("/api/vertexai/generate-image")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorMessage").value(org.hamcrest.Matchers.containsString("prompt")));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testEditImage_Success() throws Exception {
        // Arrange
        VertexAIImageRequest editRequest = VertexAIImageRequest.builder()
            .prompt("Edit this image")
            .baseImage("base64encodedimage")
            .build();

        when(usageTrackingService.canProcessImage("test@example.com")).thenReturn(true);
        when(vertexAIImagenService.editImage(any(VertexAIImageRequest.class)))
            .thenReturn(CompletableFuture.completedFuture(successResponse));

        // Act & Assert
        mockMvc.perform(post("/api/vertexai/edit-image")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(editRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testUpscaleImage_Success() throws Exception {
        // Arrange
        VertexAIImageRequest upscaleRequest = VertexAIImageRequest.builder()
            .baseImage("base64encodedimage")
            .build();

        when(usageTrackingService.canProcessImage("test@example.com")).thenReturn(true);
        when(vertexAIImagenService.upscaleImage(any(VertexAIImageRequest.class)))
            .thenReturn(CompletableFuture.completedFuture(successResponse));

        // Act & Assert
        mockMvc.perform(post("/api/vertexai/upscale-image")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(upscaleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testHealthCheck_Available() throws Exception {
        // Arrange
        when(vertexAIImagenService.isServiceAvailable()).thenReturn(true);

        // Act & Assert
        mockMvc.perform(get("/api/vertexai/health"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("available")));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testHealthCheck_Unavailable() throws Exception {
        // Arrange
        when(vertexAIImagenService.isServiceAvailable()).thenReturn(false);

        // Act & Assert
        mockMvc.perform(get("/api/vertexai/health"))
                .andExpect(status().isServiceUnavailable());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testGetAvailableModels() throws Exception {
        // Arrange
        String[] models = {"imagegeneration@006", "imagegeneration@005"};
        when(vertexAIImagenService.getAvailableModels()).thenReturn(models);

        // Act & Assert
        mockMvc.perform(get("/api/vertexai/models"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0]").value("imagegeneration@006"));
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/vertexai/generate-image")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isUnauthorized());
    }
}