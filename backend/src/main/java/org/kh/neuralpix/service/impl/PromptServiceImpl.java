package org.kh.neuralpix.service.impl;

import org.kh.neuralpix.model.Prompt;
import org.kh.neuralpix.repository.PromptRepository;
import org.kh.neuralpix.service.PromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PromptServiceImpl implements PromptService {

    private final PromptRepository repository;

    @Autowired
    public PromptServiceImpl(PromptRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Prompt> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Prompt> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public List<Prompt> getByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public List<Prompt> getPublicPrompts() {
        return repository.findByIsPublicTrue();
    }

    @Override
    public List<Prompt> getFavoritePromptsByUser(Long userId) {
        return repository.findByIsFavoriteTrueAndUserId(userId);
    }

    @Override
    public Prompt create(Prompt prompt) {
        return repository.save(prompt);
    }

    @Override
    public Prompt update(Long id, Prompt prompt) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Prompt not found with id: " + id);
        }
        prompt.setId(id);
        return repository.save(prompt);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
