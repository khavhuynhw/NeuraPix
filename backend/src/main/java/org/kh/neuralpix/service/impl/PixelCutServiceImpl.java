package org.kh.neuralpix.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.kh.neuralpix.dto.pixelcut.PixelCutImageGenerationRequest;
import org.kh.neuralpix.dto.pixelcut.PixelCutImageGenerationResponse;
import org.kh.neuralpix.model.Prompt;
import org.kh.neuralpix.service.PixelCutService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

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

    public PixelCutServiceImpl() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public CompletableFuture<PixelCutImageGenerationResponse> generateImage(PixelCutImageGenerationRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                logger.info("Sending image generation request to PixelCut.ai: {}", request.getPrompt());
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Bearer " + apiKey);
                headers.set("X-API-Key", apiKey);

                HttpEntity<PixelCutImageGenerationRequest> entity = new HttpEntity<>(request, headers);
                
                String url = baseUrl + "generate";
                
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
        return null;
    }

    @Override
    public CompletableFuture<PixelCutImageGenerationResponse> removeBackground(PixelCutImageGenerationRequest request) {
        return null;
    }

    @Override
    public CompletableFuture<PixelCutImageGenerationResponse> generateBackground(PixelCutImageGenerationRequest request) {
        return null;
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
} 