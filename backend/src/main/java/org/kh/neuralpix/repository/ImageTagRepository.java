package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.ImageTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageTagRepository extends JpaRepository<ImageTag, Long> {
    List<ImageTag> findByImageId(Long imageId);
    List<ImageTag> findByTagId(Long tagId);
    Optional<ImageTag> findByImageIdAndTagId(Long imageId, Long tagId);
    void deleteByImageIdAndTagId(Long imageId, Long tagId);
}
