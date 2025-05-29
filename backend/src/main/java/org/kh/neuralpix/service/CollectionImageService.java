package org.kh.neuralpix.service;

import org.kh.neuralpix.model.CollectionImage;

import java.util.List;
import java.util.Optional;

public interface CollectionImageService {
    List<CollectionImage> getAll();
    Optional<CollectionImage> getById(Long id);
    List<CollectionImage> getByCollectionId(Long collectionId);
    CollectionImage create(CollectionImage collectionImage);
    void delete(Long id);
}
