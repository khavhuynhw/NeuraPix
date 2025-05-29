package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.CollectionImage;
import org.kh.neuralpix.repository.CollectionImageRepository;
import org.kh.neuralpix.service.CollectionImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CollectionImageServiceImpl implements CollectionImageService {

    private final CollectionImageRepository repository;

    @Autowired
    public CollectionImageServiceImpl(CollectionImageRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<CollectionImage> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<CollectionImage> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<CollectionImage> getByCollectionId(Long collectionId) {
        return repository.findByCollectionId(collectionId);
    }

    @Override
    public CollectionImage create(CollectionImage collectionImage) {
        return repository.save(collectionImage);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
