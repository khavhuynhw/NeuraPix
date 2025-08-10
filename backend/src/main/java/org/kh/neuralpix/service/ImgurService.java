package org.kh.neuralpix.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.concurrent.CompletableFuture;

public interface ImgurService {
    CompletableFuture<String> uploadImage(MultipartFile file);
    CompletableFuture<String> uploadImageFromBase64(String base64Data);
    CompletableFuture<String> uploadImageFromUrl(String imageUrl);
}