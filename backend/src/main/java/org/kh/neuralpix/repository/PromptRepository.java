package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.Prompt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PromptRepository extends JpaRepository<Prompt, Long> {
    List<Prompt> findByUserId(Long userId);
    List<Prompt> findByIsPublicTrue();
    List<Prompt> findByIsFavoriteTrueAndUserId(Long userId);
}
