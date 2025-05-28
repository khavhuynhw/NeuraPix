package org.kh.neuralpix.service;

import org.kh.neuralpix.model.GeneratedImage;
import java.util.List;
import java.util.Optional;

public interface GeneratedImageService {
    List<GeneratedImage> findAll();
    Optional<GeneratedImage> findById(Long id);
    List<GeneratedImage> findByUserId(Long userId);
    List<GeneratedImage> findByPromptId(Long promptId);
    List<GeneratedImage> findPublicImages();
    GeneratedImage save(GeneratedImage image);
    void deleteById(Long id);
    GeneratedImage update(Long id, GeneratedImage image);
    void incrementLikesCount(Long id);
    void incrementDownloadsCount(Long id);
    void incrementViewsCount(Long id);
} 