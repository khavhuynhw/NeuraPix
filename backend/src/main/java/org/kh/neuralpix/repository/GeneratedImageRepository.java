package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.GeneratedImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GeneratedImageRepository extends JpaRepository<GeneratedImage, Long> {
    List<GeneratedImage> findByUserId(Long userId);
    List<GeneratedImage> findByPromptId(Long promptId);
    List<GeneratedImage> findByIsPublicTrue();
    
    // Work history methods with pagination
    Page<GeneratedImage> findByUserIdAndIsDeletedFalse(Long userId, Pageable pageable);
    
    @Query("SELECT gi FROM GeneratedImage gi " +
           "WHERE gi.userId = :userId AND gi.isDeleted = false " +
           "ORDER BY gi.createdAt DESC")
    Page<GeneratedImage> findUserWorkHistory(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT gi FROM GeneratedImage gi " +
           "WHERE gi.userId = :userId AND gi.isDeleted = false " +
           "AND (LOWER(gi.imageUrl) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(gi.errorMessage) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
           "ORDER BY gi.createdAt DESC")
    Page<GeneratedImage> findUserWorkHistoryWithSearch(@Param("userId") Long userId, 
                                                      @Param("searchTerm") String searchTerm, 
                                                      Pageable pageable);
} 