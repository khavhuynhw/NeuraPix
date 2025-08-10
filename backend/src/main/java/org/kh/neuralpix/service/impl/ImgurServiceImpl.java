package org.kh.neuralpix.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.kh.neuralpix.service.ImgurService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import okhttp3.*;

import java.io.IOException;
import java.util.Base64;
import java.util.concurrent.CompletableFuture;

@Service
public class ImgurServiceImpl implements ImgurService {

    private static final Logger logger = LoggerFactory.getLogger(ImgurServiceImpl.class);
    private static final String IMGUR_UPLOAD_URL = "https://api.imgur.com/3/image";

    @Value("${imgur.client-id:}")
    private String clientId;

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ImgurServiceImpl() {
        this.httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
            .readTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
            .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public CompletableFuture<String> uploadImage(MultipartFile file) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                if (clientId == null || clientId.trim().isEmpty()) {
                    throw new RuntimeException("Imgur Client ID not configured");
                }

                // Convert file to base64
                byte[] fileBytes = file.getBytes();
                String base64Image = Base64.getEncoder().encodeToString(fileBytes);

                return uploadToImgur(base64Image);
            } catch (Exception e) {
                logger.error("Error uploading image to Imgur: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to upload image to Imgur: " + e.getMessage());
            }
        });
    }

    @Override
    public CompletableFuture<String> uploadImageFromBase64(String base64Data) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                if (clientId == null || clientId.trim().isEmpty()) {
                    throw new RuntimeException("Imgur Client ID not configured");
                }

                // Remove data URL prefix if present
                String cleanBase64 = base64Data;
                if (base64Data.startsWith("data:image/")) {
                    cleanBase64 = base64Data.split(",")[1];
                }

                return uploadToImgur(cleanBase64);
            } catch (Exception e) {
                logger.error("Error uploading base64 image to Imgur: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to upload base64 image to Imgur: " + e.getMessage());
            }
        });
    }

    @Override
    public CompletableFuture<String> uploadImageFromUrl(String imageUrl) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                if (clientId == null || clientId.trim().isEmpty()) {
                    throw new RuntimeException("Imgur Client ID not configured");
                }

                // Download image first, then upload
                Request downloadRequest = new Request.Builder()
                    .url(imageUrl)
                    .build();

                try (Response response = httpClient.newCall(downloadRequest).execute()) {
                    if (!response.isSuccessful()) {
                        throw new RuntimeException("Failed to download image from URL");
                    }

                    byte[] imageBytes = response.body().bytes();
                    String base64Image = Base64.getEncoder().encodeToString(imageBytes);

                    return uploadToImgur(base64Image);
                }
            } catch (Exception e) {
                logger.error("Error uploading image from URL to Imgur: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to upload image from URL to Imgur: " + e.getMessage());
            }
        });
    }

    private String uploadToImgur(String base64Image) throws IOException {
        RequestBody requestBody = new MultipartBody.Builder()
            .setType(MultipartBody.FORM)
            .addFormDataPart("image", base64Image)
            .addFormDataPart("type", "base64")
            .build();

        Request request = new Request.Builder()
            .url(IMGUR_UPLOAD_URL)
            .addHeader("Authorization", "Client-ID " + clientId)
            .post(requestBody)
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            String responseBody = response.body().string();
            logger.debug("Imgur API response: {}", responseBody);

            if (!response.isSuccessful()) {
                logger.error("Imgur upload failed. HTTP {}: {}", response.code(), responseBody);
                throw new RuntimeException("Imgur upload failed: HTTP " + response.code());
            }

            JsonNode jsonNode = objectMapper.readTree(responseBody);
            
            if (!jsonNode.get("success").asBoolean()) {
                String error = jsonNode.has("data") && jsonNode.get("data").has("error") 
                    ? jsonNode.get("data").get("error").asText() 
                    : "Unknown error";
                throw new RuntimeException("Imgur upload failed: " + error);
            }

            String imageUrl = jsonNode.get("data").get("link").asText();
            logger.info("Successfully uploaded image to Imgur: {}", imageUrl);
            
            return imageUrl;
        }
    }
}