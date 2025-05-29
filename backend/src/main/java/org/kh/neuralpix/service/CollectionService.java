package org.kh.neuralpix.service;

import org.kh.neuralpix.model.Collection;

import java.util.List;
import java.util.Optional;

public interface CollectionService {
    List<Collection> getAllCollections();
    Optional<Collection> getCollectionById(Long id);
    Collection createCollection(Collection collection);
    Collection updateCollection(Long id, Collection collection);
    void deleteCollection(Long id);
}
