package org.kh.neuralpix.service;

import org.kh.neuralpix.model.Prompt;

import java.util.List;
import java.util.Optional;

public interface PromptService {
    List<Prompt> getAll();
    Optional<Prompt> getById(Long id);
    List<Prompt> getByUserId(Long userId);
    List<Prompt> getPublicPrompts();
    List<Prompt> getFavoritePromptsByUser(Long userId);
    Prompt create(Prompt prompt);
    Prompt update(Long id, Prompt prompt);
    void delete(Long id);
}
