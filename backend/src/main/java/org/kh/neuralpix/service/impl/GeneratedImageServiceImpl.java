package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.GeneratedImage;
import org.kh.neuralpix.repository.GeneratedImageRepository;
import org.kh.neuralpix.service.GeneratedImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class GeneratedImageServiceImpl implements GeneratedImageService {

    private final GeneratedImageRepository generatedImageRepository;

    @Autowired
    public GeneratedImageServiceImpl(GeneratedImageRepository generatedImageRepository) {
        this.generatedImageRepository = generatedImageRepository;
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
} 