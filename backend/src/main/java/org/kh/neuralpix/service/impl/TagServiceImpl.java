package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.Tag;
import org.kh.neuralpix.repository.TagRepository;
import org.kh.neuralpix.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TagServiceImpl implements TagService {

    private final TagRepository repository;

    @Autowired
    public TagServiceImpl(TagRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Tag> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Tag> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Optional<Tag> getByName(String name) {
        return repository.findByName(name);
    }

    @Override
    public Tag create(Tag tag) {
        if (repository.existsByName(tag.getName())) {
            throw new IllegalArgumentException("Tag with this name already exists");
        }
        return repository.save(tag);
    }

    @Override
    public Tag update(Long id, Tag tag) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Tag not found with id: " + id);
        }
        tag.setId(id);
        return repository.save(tag);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
