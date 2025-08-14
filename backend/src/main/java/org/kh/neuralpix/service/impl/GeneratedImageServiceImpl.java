package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.dto.request.GeneratedImageRequestDto;
import org.kh.neuralpix.dto.response.GeneratedImageResponseDto;
import org.kh.neuralpix.dto.response.WorkHistoryResponseDto;
import org.kh.neuralpix.mapper.GeneratedImageMapper;
import org.kh.neuralpix.model.GeneratedImage;
import org.kh.neuralpix.model.enums.GenerationStatus;
import org.kh.neuralpix.repository.GeneratedImageRepository;
import org.kh.neuralpix.service.GeneratedImageService;
import org.kh.neuralpix.service.UsageTrackingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class GeneratedImageServiceImpl implements GeneratedImageService {

    private static final Logger logger = LoggerFactory.getLogger(GeneratedImageServiceImpl.class);

    private final GeneratedImageRepository generatedImageRepository;
    private final UsageTrackingService usageTrackingService;
    private final GeneratedImageMapper generatedImageMapper;

    @Autowired
    public GeneratedImageServiceImpl(GeneratedImageRepository generatedImageRepository,
                                   UsageTrackingService usageTrackingService,
                                   GeneratedImageMapper generatedImageMapper) {
        this.generatedImageRepository = generatedImageRepository;
        this.usageTrackingService = usageTrackingService;
        this.generatedImageMapper = generatedImageMapper;
    }

    @Override
    public List<GeneratedImage> findAll() {
        return generatedImageRepository.findAll();
    }

    @Override
    public Optional<GeneratedImage> findById(Long id) {
        return generatedImageRepository.findById(id);
    }

    @Override
    public List<GeneratedImage> findByUserId(Long userId) {
        return generatedImageRepository.findByUserId(userId);
    }

    @Override
    public List<GeneratedImage> findByPromptId(Long promptId) {
        return generatedImageRepository.findByPromptId(promptId);
    }

    @Override
    public List<GeneratedImage> findPublicImages() {
        return generatedImageRepository.findByIsPublicTrue();
    }

    @Override
    public GeneratedImage save(GeneratedImage image) {
        return generatedImageRepository.save(image);
    }

    @Override
    public GeneratedImage createImageWithUsageTracking(GeneratedImage image) {
        Long userId = image.getUserId();
        
        // Check if user can generate image based on their subscription limits
        if (!usageTrackingService.canGenerateImage(userId)) {
            String message = "Generation limit exceeded. ";
            if (usageTrackingService.hasExceededDailyLimit(userId)) {
                message += "Daily limit reached. ";
            }
            if (usageTrackingService.hasExceededMonthlyLimit(userId)) {
                message += "Monthly limit reached.";
            }
            logger.warn("User {} attempted to generate image but exceeded limits: {}", userId, message);
            throw new RuntimeException(message);
        }
        
        // Save the image
        GeneratedImage savedImage = generatedImageRepository.save(image);
        
        // Track the usage after successful image creation
        try {
            usageTrackingService.trackImageGeneration(userId);
            logger.info("Successfully tracked image generation for user: {}", userId);
        } catch (Exception e) {
            logger.error("Failed to track usage for user: {} after image generation", userId, e);
            // Don't fail the image creation, just log the error
        }
        
        return savedImage;
    }

    @Override
    public void deleteById(Long id) {
        generatedImageRepository.deleteById(id);
    }

    @Override
    public GeneratedImage update(Long id, GeneratedImage image) {
        if (generatedImageRepository.existsById(id)) {
            image.setId(id);
            return generatedImageRepository.save(image);
        }
        throw new RuntimeException("GeneratedImage not found with id: " + id);
    }

    @Override
    public void incrementLikesCount(Long id) {
        generatedImageRepository.findById(id).ifPresent(image -> {
            image.setLikesCount(image.getLikesCount() + 1);
            generatedImageRepository.save(image);
        });
    }

    @Override
    public void incrementDownloadsCount(Long id) {
        generatedImageRepository.findById(id).ifPresent(image -> {
            image.setDownloadsCount(image.getDownloadsCount() + 1);
            generatedImageRepository.save(image);
        });
    }

    @Override
    public void incrementViewsCount(Long id) {
        generatedImageRepository.findById(id).ifPresent(image -> {
            image.setViewsCount(image.getViewsCount() + 1);
            generatedImageRepository.save(image);
        });
    }

    // DTO-based methods implementation
    @Override
    public GeneratedImageResponseDto createImage(GeneratedImageRequestDto requestDto, Long userId) {
        GeneratedImage entity = generatedImageMapper.toEntity(requestDto, userId);
        GeneratedImage savedEntity = createImageWithUsageTracking(entity);
        return generatedImageMapper.toDto(savedEntity);
    }

    @Override
    public List<GeneratedImageResponseDto> getAllImagesDto() {
        List<GeneratedImage> entities = findAll();
        return generatedImageMapper.toDtoList(entities);
    }

    @Override
    public Optional<GeneratedImageResponseDto> getImageByIdDto(Long id) {
        return findById(id).map(generatedImageMapper::toDto);
    }

    @Override
    public List<GeneratedImageResponseDto> getImagesByUserIdDto(Long userId) {
        List<GeneratedImage> entities = findByUserId(userId);
        return generatedImageMapper.toDtoList(entities);
    }

    @Override
    public List<GeneratedImageResponseDto> getPublicImagesDto() {
        List<GeneratedImage> entities = findPublicImages();
        return generatedImageMapper.toDtoList(entities);
    }

    @Override
    public GeneratedImageResponseDto updateImageDto(Long id, GeneratedImageRequestDto requestDto) {
        GeneratedImage existingEntity = generatedImageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GeneratedImage not found with id: " + id));
        
        // Update only non-null fields
        if (requestDto.getImageUrl() != null) existingEntity.setImageUrl(requestDto.getImageUrl());
        if (requestDto.getThumbnailUrl() != null) existingEntity.setThumbnailUrl(requestDto.getThumbnailUrl());
        if (requestDto.getFileSize() != null) existingEntity.setFileSize(requestDto.getFileSize());
        if (requestDto.getGenerationTime() != null) existingEntity.setGenerationTime(requestDto.getGenerationTime());
        if (requestDto.getStatus() != null) {
            try {
                existingEntity.setStatus(GenerationStatus.valueOf(requestDto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid status provided: {}", requestDto.getStatus());
            }
        }
        if (requestDto.getErrorMessage() != null) existingEntity.setErrorMessage(requestDto.getErrorMessage());
        if (requestDto.getIsPublic() != null) existingEntity.setIsPublic(requestDto.getIsPublic());
        
        GeneratedImage updatedEntity = generatedImageRepository.save(existingEntity);
        return generatedImageMapper.toDto(updatedEntity);
    }

    // Work history methods implementation
    @Override
    public WorkHistoryResponseDto getUserWorkHistory(Long userId, Pageable pageable) {
        Page<GeneratedImage> page = generatedImageRepository.findUserWorkHistory(userId, pageable);
        return generatedImageMapper.toWorkHistoryDto(page);
    }

    @Override
    public WorkHistoryResponseDto getUserWorkHistory(Long userId, String searchTerm, Pageable pageable) {
        Page<GeneratedImage> page;
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            page = generatedImageRepository.findUserWorkHistoryWithSearch(userId, searchTerm, pageable);
        } else {
            page = generatedImageRepository.findUserWorkHistory(userId, pageable);
        }
        return generatedImageMapper.toWorkHistoryDto(page);
    }

    // Method to create image from PixelCut processing
    @Override
    public GeneratedImage createImageFromPixelCutProcessing(String imageUrl, String thumbnailUrl, 
                                                           Long userId, Integer fileSize, 
                                                           String operation, String promptText) {
        GeneratedImage image = new GeneratedImage();
        image.setImageUrl(imageUrl);
        image.setThumbnailUrl(thumbnailUrl);
        image.setUserId(userId);
        image.setPromptId(null); // No prompt needed for PixelCut operations
        image.setFileSize(fileSize);
        image.setStatus(GenerationStatus.COMPLETED);
        image.setIsPublic(false);
        image.setLikesCount(0);
        image.setDownloadsCount(0);
        image.setViewsCount(0);
        image.setIsDeleted(false);
        
        logger.info("Creating generated image record for user: {}, operation: {}, imageUrl: {}", 
                   userId, operation, imageUrl);
        
        return createImageWithUsageTracking(image);
    }
} 