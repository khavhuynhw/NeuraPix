package org.kh.neuralpix.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.cloudinary.Transformation;
import org.kh.neuralpix.service.CloudinaryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
// removed unused import
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    private static final Logger logger = LoggerFactory.getLogger(CloudinaryServiceImpl.class);

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${cloudinary.folder:neuralpix}")
    private String defaultFolder;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        if (cloudName == null || cloudName.trim().isEmpty() ||
            apiKey == null || apiKey.trim().isEmpty() ||
            apiSecret == null || apiSecret.trim().isEmpty()) {
            logger.warn("Cloudinary credentials not configured properly");
            return;
        }

        cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret
        ));

        logger.info("Cloudinary initialized successfully for cloud: {}", cloudName);
    }

    @Override
    public CompletableFuture<String> uploadImage(MultipartFile file) {
        return uploadImage(file, defaultFolder);
    }

    @Override
    public CompletableFuture<String> uploadImage(MultipartFile file, String folder) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                validateCloudinaryConfig();
                
                Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "unique_filename", true,
                    "use_filename", false,
                    "quality", "auto",
                    "fetch_format", "auto",
                    "format", "png"
                );

                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(file.getBytes(), uploadParams);
                String imageUrl = (String) uploadResult.get("secure_url");
                
                logger.info("Successfully uploaded image to Cloudinary: {}", imageUrl);
                return imageUrl;
                
            } catch (Exception e) {
                logger.error("Error uploading image to Cloudinary: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to upload image to Cloudinary: " + e.getMessage());
            }
        });
    }

    @Override
    public CompletableFuture<String> uploadImageFromBase64(String base64Data) {
        return uploadImageFromBase64(base64Data, defaultFolder);
    }

    @Override
    public CompletableFuture<String> uploadImageFromBase64(String base64Data, String folder) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                validateCloudinaryConfig();

                // Clean base64 data if it has data URL prefix
                String cleanBase64 = base64Data;
                if (base64Data.startsWith("data:image/")) {
                    cleanBase64 = base64Data.split(",")[1];
                }

                // Optionally validate base64 (skip storing variable to avoid unused warning)
                Base64.getDecoder().decode(cleanBase64);

                Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "unique_filename", true,
                    "use_filename", false,
                    "quality", "auto",
                    "fetch_format", "auto",
                    "format", "png"
                );

                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload("data:image/png;base64," + cleanBase64, uploadParams);
                String imageUrl = (String) uploadResult.get("secure_url");
                
                logger.info("Successfully uploaded base64 image to Cloudinary: {}", imageUrl);
                return imageUrl;
                
            } catch (Exception e) {
                logger.error("Error uploading base64 image to Cloudinary: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to upload base64 image to Cloudinary: " + e.getMessage());
            }
        });
    }

    @Override
    public CompletableFuture<String> uploadImageFromUrl(String imageUrl) {
        return uploadImageFromUrl(imageUrl, defaultFolder);
    }

    @Override
    public CompletableFuture<String> uploadImageFromUrl(String imageUrl, String folder) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                validateCloudinaryConfig();

                Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "unique_filename", true,
                    "use_filename", false,
                    "quality", "auto",
                    "fetch_format", "auto",
                    "format", "png"
                );

                @SuppressWarnings("unchecked")
                Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(imageUrl, uploadParams);
                String cloudinaryUrl = (String) uploadResult.get("secure_url");
                
                logger.info("Successfully uploaded image from URL to Cloudinary: {} -> {}", imageUrl, cloudinaryUrl);
                return cloudinaryUrl;
                
            } catch (Exception e) {
                logger.error("Error uploading image from URL to Cloudinary: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to upload image from URL to Cloudinary: " + e.getMessage());
            }
        });
    }

    @Override
    public CompletableFuture<Boolean> deleteImage(String publicId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                validateCloudinaryConfig();

                @SuppressWarnings("unchecked")
                Map<String, Object> deleteResult = (Map<String, Object>) cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                String result = (String) deleteResult.get("result");
                
                boolean success = "ok".equals(result);
                logger.info("Image deletion result for {}: {}", publicId, result);
                return success;
                
            } catch (Exception e) {
                logger.error("Error deleting image from Cloudinary: {}", e.getMessage(), e);
                return false;
            }
        });
    }

    @Override
    public CompletableFuture<String> generateTransformationUrl(String publicId, int width, int height, String format) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                validateCloudinaryConfig();

                Transformation<?> transformation = new Transformation<>()
                        .width(width)
                        .height(height)
                        .crop("fill")
                        .quality("auto")
                        .fetchFormat(format != null ? format : "auto");

                String transformedUrl = cloudinary.url()
                        .transformation(transformation)
                        .secure(true)
                        .generate(publicId);

                logger.debug("Generated transformation URL: {}", transformedUrl);
                return transformedUrl;
                
            } catch (Exception e) {
                logger.error("Error generating transformation URL: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to generate transformation URL: " + e.getMessage());
            }
        });
    }

    private void validateCloudinaryConfig() {
        if (cloudinary == null) {
            throw new RuntimeException("Cloudinary not initialized. Please check your configuration.");
        }
    }
}