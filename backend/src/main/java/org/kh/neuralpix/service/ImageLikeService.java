package org.kh.neuralpix.service;

import org.kh.neuralpix.model.ImageLike;

import java.util.List;
import java.util.Optional;

public interface ImageLikeService {
    List<ImageLike> getAllLikes();
    Optional<ImageLike> getById(Long id);
    List<ImageLike> getLikesByImageId(Long imageId);
    List<ImageLike> getLikesByUserId(Long userId);
    Optional<ImageLike> getByUserIdAndImageId(Long userId, Long imageId);
    ImageLike likeImage(ImageLike imageLike);
    void unlikeImage(Long userId, Long imageId);
}
