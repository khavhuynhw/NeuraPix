package org.kh.neuralpix.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.concurrent.CompletableFuture;

public interface CloudinaryService {
    CompletableFuture<String> uploadImage(MultipartFile file);
    CompletableFuture<String> uploadImage(MultipartFile file, String folder);
    CompletableFuture<String> uploadImageFromBase64(String base64Data);
    CompletableFuture<String> uploadImageFromBase64(String base64Data, String folder);
    CompletableFuture<String> uploadImageFromUrl(String imageUrl);
    CompletableFuture<String> uploadImageFromUrl(String imageUrl, String folder);
    CompletableFuture<Boolean> deleteImage(String publicId);
    CompletableFuture<String> generateTransformationUrl(String publicId, int width, int height, String format);
    String uploadImageFromBytes(byte[] imageBytes, String filename);
}