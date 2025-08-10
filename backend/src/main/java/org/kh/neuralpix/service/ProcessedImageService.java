package org.kh.neuralpix.service;

import org.kh.neuralpix.model.ProcessedImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ProcessedImageService {
    
    // Save processed image
    ProcessedImage saveProcessedImage(ProcessedImage processedImage);
    
    // Get user's images
    List<ProcessedImage> getUserImages(Long userId);
    Page<ProcessedImage> getUserImages(Long userId, Pageable pageable);
    
    // Get user's successful images only
    List<ProcessedImage> getUserSuccessfulImages(Long userId);
    Page<ProcessedImage> getUserSuccessfulImages(Long userId, Pageable pageable);
    
    // Get by operation type
    List<ProcessedImage> getUserImagesByType(Long userId, ProcessedImage.OperationType operationType);
    
    // Get favorites
    List<ProcessedImage> getUserFavorites(Long userId);
    
    // Check if image already processed
    Optional<ProcessedImage> findExistingProcessedImage(Long userId, String originalUrl, ProcessedImage.OperationType operationType);
    
    // Mark as favorite
    ProcessedImage toggleFavorite(Long imageId, Long userId);
    
    // Increment view count
    ProcessedImage incrementViewCount(Long imageId);
    
    // Search images
    List<ProcessedImage> searchUserImages(Long userId, String keyword);
    
    // Get statistics
    Long getUserProcessingCount(Long userId);
    Long getUserProcessingCountByType(Long userId, ProcessedImage.OperationType operationType);
    Long getUserRecentProcessingCount(Long userId, int days);
    
    // Public gallery
    Page<ProcessedImage> getPublicGallery(Pageable pageable);
    Page<ProcessedImage> getPopularImages(Pageable pageable);
    
    // Delete image
    void deleteProcessedImage(Long imageId, Long userId);
    
    // Cleanup old failed attempts
    void cleanupFailedProcessing(int daysOld);
}