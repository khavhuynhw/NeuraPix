package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.GeneratedImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GeneratedImageRepository extends JpaRepository<GeneratedImage, Long> {
    List<GeneratedImage> findByUserId(Long userId);
    List<GeneratedImage> findByPromptId(Long promptId);
    List<GeneratedImage> findByIsPublicTrue();
} 