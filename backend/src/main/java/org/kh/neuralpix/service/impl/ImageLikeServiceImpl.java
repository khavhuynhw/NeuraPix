package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.ImageLike;
import org.kh.neuralpix.repository.ImageLikeRepository;
import org.kh.neuralpix.service.ImageLikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ImageLikeServiceImpl implements ImageLikeService {

    private final ImageLikeRepository repository;

    @Autowired
    public ImageLikeServiceImpl(ImageLikeRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<ImageLike> getAllLikes() {
        return repository.findAll();
    }

    @Override
    public Optional<ImageLike> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<ImageLike> getLikesByImageId(Long imageId) {
        return repository.findByImageId(imageId);
    }

    @Override
    public List<ImageLike> getLikesByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public Optional<ImageLike> getByUserIdAndImageId(Long userId, Long imageId) {
        return repository.findByUserIdAndImageId(userId, imageId);
    }

    @Override
    public ImageLike likeImage(ImageLike imageLike) {
        // Tránh like trùng
        return repository.findByUserIdAndImageId(imageLike.getUserId(), imageLike.getImageId())
                .orElseGet(() -> repository.save(imageLike));
    }

    @Override
    public void unlikeImage(Long userId, Long imageId) {
        repository.deleteByUserIdAndImageId(userId, imageId);
    }
}
