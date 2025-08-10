package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.ProcessedImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProcessedImageRepository extends JpaRepository<ProcessedImage, Long> {

    // Find by user
    List<ProcessedImage> findByUserIdOrderByCreatedAtDesc(Long userId);
    Page<ProcessedImage> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // Find by operation type
    List<ProcessedImage> findByUserIdAndOperationTypeOrderByCreatedAtDesc(Long userId, ProcessedImage.OperationType operationType);

    // Find successful operations only
    List<ProcessedImage> findByUserIdAndSuccessIsTrueOrderByCreatedAtDesc(Long userId);
    Page<ProcessedImage> findByUserIdAndSuccessIsTrueOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // Find favorites
    List<ProcessedImage> findByUserIdAndIsFavoriteTrueOrderByCreatedAtDesc(Long userId);

    // Find public images
    Page<ProcessedImage> findByIsPublicTrueAndSuccessIsTrueOrderByCreatedAtDesc(Pageable pageable);

    // Check if image URL already processed
    Optional<ProcessedImage> findByUserIdAndOriginalUrlAndOperationType(Long userId, String originalUrl, ProcessedImage.OperationType operationType);

    // Find by processed URL (for reuse)
    Optional<ProcessedImage> findByProcessedUrl(String processedUrl);

    // Statistics queries
    @Query("SELECT COUNT(p) FROM ProcessedImage p WHERE p.userId = :userId AND p.success = true")
    Long countSuccessfulProcessingsByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(p) FROM ProcessedImage p WHERE p.userId = :userId AND p.operationType = :operationType AND p.success = true")
    Long countSuccessfulProcessingsByUserAndType(@Param("userId") Long userId, @Param("operationType") ProcessedImage.OperationType operationType);

    @Query("SELECT COUNT(p) FROM ProcessedImage p WHERE p.userId = :userId AND p.createdAt >= :fromDate AND p.success = true")
    Long countSuccessfulProcessingsByUserSince(@Param("userId") Long userId, @Param("fromDate") LocalDateTime fromDate);

    // Find recent activity
    @Query("SELECT p FROM ProcessedImage p WHERE p.userId = :userId AND p.createdAt >= :fromDate ORDER BY p.createdAt DESC")
    List<ProcessedImage> findRecentActivity(@Param("userId") Long userId, @Param("fromDate") LocalDateTime fromDate);

    // Search by tags or prompt
    @Query("SELECT p FROM ProcessedImage p WHERE p.userId = :userId AND (p.tags LIKE %:keyword% OR p.prompt LIKE %:keyword%) AND p.success = true ORDER BY p.createdAt DESC")
    List<ProcessedImage> searchByKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);

    // Popular images (by view count)
    @Query("SELECT p FROM ProcessedImage p WHERE p.isPublic = true AND p.success = true ORDER BY p.viewCount DESC, p.createdAt DESC")
    Page<ProcessedImage> findPopularPublicImages(Pageable pageable);

    // Delete old unsuccessful attempts (cleanup)
    @Query("DELETE FROM ProcessedImage p WHERE p.success = false AND p.createdAt < :beforeDate")
    void deleteOldFailedProcessing(@Param("beforeDate") LocalDateTime beforeDate);
}