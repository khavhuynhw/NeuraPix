package org.kh.neuralpix.service;

import org.kh.neuralpix.model.Tag;

import java.util.List;
import java.util.Optional;

public interface TagService {
    List<Tag> getAll();
    Optional<Tag> getById(Long id);
    Optional<Tag> getByName(String name);
    Tag create(Tag tag);
    Tag update(Long id, Tag tag);
    void delete(Long id);
}
