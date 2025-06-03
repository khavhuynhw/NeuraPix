package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.ImageTag;
import org.kh.neuralpix.repository.ImageTagRepository;
import org.kh.neuralpix.service.ImageTagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ImageTagServiceImpl implements ImageTagService {

    private final ImageTagRepository repository;

    @Autowired
    public ImageTagServiceImpl(ImageTagRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<ImageTag> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<ImageTag> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<ImageTag> getByImageId(Long imageId) {
        return repository.findByImageId(imageId);
    }

    @Override
    public List<ImageTag> getByTagId(Long tagId) {
        return repository.findByTagId(tagId);
    }

    @Override
    public Optional<ImageTag> getByImageIdAndTagId(Long imageId, Long tagId) {
        return repository.findByImageIdAndTagId(imageId, tagId);
    }

    @Override
    public ImageTag create(ImageTag imageTag) {
        // Tránh duplicate
        return repository.findByImageIdAndTagId(imageTag.getImageId(), imageTag.getTagId())
                .orElseGet(() -> repository.save(imageTag));
    }

    @Override
    public void deleteByImageIdAndTagId(Long imageId, Long tagId) {
        repository.deleteByImageIdAndTagId(imageId, tagId);
    }
}
