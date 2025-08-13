package org.kh.neuralpix.service;

import org.kh.neuralpix.dto.UserDto;
import org.kh.neuralpix.dto.users.UserCreateRequestDto;
import org.kh.neuralpix.dto.users.UserUpdateRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface UserService {
    Page<UserDto> findUsersWithFilters(String search, String role, String status, String plan, Pageable pageable);
    Optional<UserDto> findById(Long id);
    Optional<UserDto> findByUsername(String username);
    Optional<UserDto> findByEmail(String email);
    UserDto create(UserCreateRequestDto userCreateRequestDto);
    void deleteById(Long id);
    UserDto update(Long id, UserUpdateRequestDto userUpdateRequestDto);
    UserDto updateUserAvatar(Long id, String avatarUrl);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}