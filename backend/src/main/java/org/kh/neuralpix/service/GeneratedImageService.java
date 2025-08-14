package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.request.GeneratedImageRequestDto;
import org.kh.neuralpix.dto.response.GeneratedImageResponseDto;
import org.kh.neuralpix.dto.response.WorkHistoryResponseDto;
import org.kh.neuralpix.model.GeneratedImage;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface GeneratedImageService {
    List<GeneratedImage> findAll();
    Optional<GeneratedImage> findById(Long id);
    List<GeneratedImage> findByUserId(Long userId);
    List<GeneratedImage> findByPromptId(Long promptId);
    List<GeneratedImage> findPublicImages();
    GeneratedImage save(GeneratedImage image);
    GeneratedImage createImageWithUsageTracking(GeneratedImage image);
    void deleteById(Long id);
    GeneratedImage update(Long id, GeneratedImage image);
    void incrementLikesCount(Long id);
    void incrementDownloadsCount(Long id);
    void incrementViewsCount(Long id);
    
    // DTO-based methods
    GeneratedImageResponseDto createImage(GeneratedImageRequestDto requestDto, Long userId);
    List<GeneratedImageResponseDto> getAllImagesDto();
    Optional<GeneratedImageResponseDto> getImageByIdDto(Long id);
    List<GeneratedImageResponseDto> getImagesByUserIdDto(Long userId);
    List<GeneratedImageResponseDto> getPublicImagesDto();
    GeneratedImageResponseDto updateImageDto(Long id, GeneratedImageRequestDto requestDto);
    
    // Work history methods
    WorkHistoryResponseDto getUserWorkHistory(Long userId, Pageable pageable);
    WorkHistoryResponseDto getUserWorkHistory(Long userId, String searchTerm, Pageable pageable);
    
    // Method to create image from PixelCut processing
    GeneratedImage createImageFromPixelCutProcessing(String imageUrl, String thumbnailUrl, 
                                                    Long userId, Integer fileSize, 
                                                    String operation, String promptText);
} 