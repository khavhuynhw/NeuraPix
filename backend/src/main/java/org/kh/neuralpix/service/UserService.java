package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.users.UserCreateRequestDto;
import org.kh.neuralpix.dto.users.UserUpdateRequestDto;
import org.kh.neuralpix.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface UserService {
    Page<User> findUsersWithFilters(String search, String role, String status, String plan, Pageable pageable);
    Optional<User> findById(Long id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    User create(UserCreateRequestDto userCreateRequestDto);
    void deleteById(Long id);
    User update(Long id, UserUpdateRequestDto userUpdateRequestDto);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
} 