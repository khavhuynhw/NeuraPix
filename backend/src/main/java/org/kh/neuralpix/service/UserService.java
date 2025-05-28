package org.kh.neuralpix.service;

import org.kh.neuralpix.model.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> findAll();
    Optional<User> findById(Long id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    User save(User user);
    void deleteById(Long id);
    User update(Long id, User user);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
} 