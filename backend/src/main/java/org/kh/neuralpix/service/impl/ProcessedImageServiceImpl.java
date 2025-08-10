package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.ProcessedImage;
import org.kh.neuralpix.repository.ProcessedImageRepository;
import org.kh.neuralpix.service.ProcessedImageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProcessedImageServiceImpl implements ProcessedImageService {

    private static final Logger logger = LoggerFactory.getLogger(ProcessedImageServiceImpl.class);

    @Autowired
    private ProcessedImageRepository processedImageRepository;

    @Override
    public ProcessedImage saveProcessedImage(ProcessedImage processedImage) {
        try {
            ProcessedImage saved = processedImageRepository.save(processedImage);
            logger.info("Saved processed image with ID: {} for user: {}", saved.getId(), saved.getUserId());
            return saved;
        } catch (Exception e) {
            logger.error("Error saving processed image: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save processed image", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcessedImage> getUserImages(Long userId) {
        return processedImageRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProcessedImage> getUserImages(Long userId, Pageable pageable) {
        return processedImageRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcessedImage> getUserSuccessfulImages(Long userId) {
        return processedImageRepository.findByUserIdAndSuccessIsTrueOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProcessedImage> getUserSuccessfulImages(Long userId, Pageable pageable) {
        return processedImageRepository.findByUserIdAndSuccessIsTrueOrderByCreatedAtDesc(userId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcessedImage> getUserImagesByType(Long userId, ProcessedImage.OperationType operationType) {
        return processedImageRepository.findByUserIdAndOperationTypeOrderByCreatedAtDesc(userId, operationType);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcessedImage> getUserFavorites(Long userId) {
        return processedImageRepository.findByUserIdAndIsFavoriteTrueOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProcessedImage> findExistingProcessedImage(Long userId, String originalUrl, ProcessedImage.OperationType operationType) {
        return processedImageRepository.findByUserIdAndOriginalUrlAndOperationType(userId, originalUrl, operationType);
    }

    @Override
    public ProcessedImage toggleFavorite(Long imageId, Long userId) {
        Optional<ProcessedImage> imageOpt = processedImageRepository.findById(imageId);
        if (imageOpt.isPresent()) {
            ProcessedImage image = imageOpt.get();
            if (!image.getUserId().equals(userId)) {
                throw new RuntimeException("Access denied: Image does not belong to user");
            }
            image.setIsFavorite(!image.getIsFavorite());
            return processedImageRepository.save(image);
        }
        throw new RuntimeException("Processed image not found with ID: " + imageId);
    }

    @Override
    public ProcessedImage incrementViewCount(Long imageId) {
        Optional<ProcessedImage> imageOpt = processedImageRepository.findById(imageId);
        if (imageOpt.isPresent()) {
            ProcessedImage image = imageOpt.get();
            image.setViewCount((image.getViewCount() != null ? image.getViewCount() : 0) + 1);
            return processedImageRepository.save(image);
        }
        throw new RuntimeException("Processed image not found with ID: " + imageId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProcessedImage> searchUserImages(Long userId, String keyword) {
        return processedImageRepository.searchByKeyword(userId, keyword);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUserProcessingCount(Long userId) {
        return processedImageRepository.countSuccessfulProcessingsByUser(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUserProcessingCountByType(Long userId, ProcessedImage.OperationType operationType) {
        return processedImageRepository.countSuccessfulProcessingsByUserAndType(userId, operationType);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUserRecentProcessingCount(Long userId, int days) {
        LocalDateTime fromDate = LocalDateTime.now().minusDays(days);
        return processedImageRepository.countSuccessfulProcessingsByUserSince(userId, fromDate);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProcessedImage> getPublicGallery(Pageable pageable) {
        return processedImageRepository.findByIsPublicTrueAndSuccessIsTrueOrderByCreatedAtDesc(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProcessedImage> getPopularImages(Pageable pageable) {
        return processedImageRepository.findPopularPublicImages(pageable);
    }

    @Override
    public void deleteProcessedImage(Long imageId, Long userId) {
        Optional<ProcessedImage> imageOpt = processedImageRepository.findById(imageId);
        if (imageOpt.isPresent()) {
            ProcessedImage image = imageOpt.get();
            if (!image.getUserId().equals(userId)) {
                throw new RuntimeException("Access denied: Image does not belong to user");
            }
            processedImageRepository.delete(image);
            logger.info("Deleted processed image with ID: {} for user: {}", imageId, userId);
        } else {
            throw new RuntimeException("Processed image not found with ID: " + imageId);
        }
    }

    @Override
    public void cleanupFailedProcessing(int daysOld) {
        LocalDateTime beforeDate = LocalDateTime.now().minusDays(daysOld);
        processedImageRepository.deleteOldFailedProcessing(beforeDate);
        logger.info("Cleaned up failed processing attempts older than {} days", daysOld);
    }
}