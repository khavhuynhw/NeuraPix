package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.ImageLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageLikeRepository extends JpaRepository<ImageLike, Long> {
    List<ImageLike> findByImageId(Long imageId);
    List<ImageLike> findByUserId(Long userId);
    Optional<ImageLike> findByUserIdAndImageId(Long userId, Long imageId);
    void deleteByUserIdAndImageId(Long userId, Long imageId);
}
