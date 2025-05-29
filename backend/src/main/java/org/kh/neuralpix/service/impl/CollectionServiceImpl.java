package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.Collection;
import org.kh.neuralpix.repository.CollectionRepository;
import org.kh.neuralpix.service.CollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CollectionServiceImpl implements CollectionService {

    private final CollectionRepository collectionRepository;

    @Autowired
    public CollectionServiceImpl(CollectionRepository collectionRepository) {
        this.collectionRepository = collectionRepository;
    }

    @Override
    public List<Collection> getAllCollections() {
        return collectionRepository.findAll();
    }

    @Override
    public Optional<Collection> getCollectionById(Long id) {
        return collectionRepository.findById(id);
    }

    @Override
    public Collection createCollection(Collection collection) {
        return collectionRepository.save(collection);
    }

    @Override
    public Collection updateCollection(Long id, Collection updatedCollection) {
        return collectionRepository.findById(id)
                .map(existing -> {
                    existing.setName(updatedCollection.getName());
                    existing.setDescription(updatedCollection.getDescription());
                    existing.setIsPublic(updatedCollection.getIsPublic());
                    existing.setCoverImageId(updatedCollection.getCoverImageId());
                    return collectionRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Collection not found with id: " + id));
    }

    @Override
    public void deleteCollection(Long id) {
        collectionRepository.deleteById(id);
    }
}
