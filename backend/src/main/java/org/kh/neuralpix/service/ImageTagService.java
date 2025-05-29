package org.kh.neuralpix.service;

import org.kh.neuralpix.model.ImageTag;

import java.util.List;
import java.util.Optional;

public interface ImageTagService {
    List<ImageTag> getAll();
    Optional<ImageTag> getById(Long id);
    List<ImageTag> getByImageId(Long imageId);
    List<ImageTag> getByTagId(Long tagId);
    Optional<ImageTag> getByImageIdAndTagId(Long imageId, Long tagId);
    ImageTag create(ImageTag imageTag);
    void deleteByImageIdAndTagId(Long imageId, Long tagId);
}
