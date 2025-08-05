package org.kh.neuralpix.service.impl;

import jakarta.persistence.criteria.Predicate;
import org.kh.neuralpix.dto.users.UserCreateRequestDto;
import org.kh.neuralpix.dto.users.UserUpdateRequestDto;
import org.kh.neuralpix.exception.ResourceNotFoundException;
import org.kh.neuralpix.model.User;
import org.kh.neuralpix.repository.UserRepository;
import org.kh.neuralpix.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Page<User> findUsersWithFilters(String search, String role, String status, String plan, Pageable pageable) {
        return userRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                Predicate firstNameMatch = cb.like(cb.lower(root.get("firstName")), "%" + search.toLowerCase() + "%");
                Predicate lastNameMatch  = cb.like(cb.lower(root.get("lastName")), "%" + search.toLowerCase() + "%");
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), "%" + search.toLowerCase() + "%");
                predicates.add(cb.or(firstNameMatch, emailMatch,lastNameMatch));
            }

            if (role != null && !role.equals("all")) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            if (status != null && !status.equals("all")) {
                boolean isActive = status.equalsIgnoreCase("active");
                predicates.add(cb.equal(root.get("isActive"), isActive));
            }

            if (plan != null && !plan.equals("all")) {
                predicates.add(cb.equal(root.get("subscriptionTier"), plan));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User create(UserCreateRequestDto userCreateRequestDto) {
        User user = new User();
        user.setUsername(userCreateRequestDto.getUsername());
        user.setEmail(userCreateRequestDto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(userCreateRequestDto.getPassword()));
        user.setRole(userCreateRequestDto.getRole());
        user.setFirstName(userCreateRequestDto.getFirstName());
        user.setLastName(userCreateRequestDto.getLastName());
        user.setAvatarUrl(userCreateRequestDto.getAvatarUrl());
        user.setCredits(userCreateRequestDto.getCredits());
        user.setSubscriptionTier(userCreateRequestDto.getSubscriptionTier());
        user.setIsActive(userCreateRequestDto.getIsActive());
        user.setEmailVerified(userCreateRequestDto.getEmailVerified());
        
        return userRepository.save(user);
    }

    @Override
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public User update(Long id, UserUpdateRequestDto userUpdateRequestDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Update only non-null fields from DTO
        if (userUpdateRequestDto.getUsername() != null) {
            existingUser.setUsername(userUpdateRequestDto.getUsername());
        }
        if (userUpdateRequestDto.getEmail() != null) {
            existingUser.setEmail(userUpdateRequestDto.getEmail());
        }
        if (userUpdateRequestDto.getPassword() != null) {
            existingUser.setPasswordHash(passwordEncoder.encode(userUpdateRequestDto.getPassword()));
        }
        if (userUpdateRequestDto.getRole() != null) {
            existingUser.setRole(userUpdateRequestDto.getRole());
        }
        if (userUpdateRequestDto.getFirstName() != null) {
            existingUser.setFirstName(userUpdateRequestDto.getFirstName());
        }
        if (userUpdateRequestDto.getLastName() != null) {
            existingUser.setLastName(userUpdateRequestDto.getLastName());
        }
        if (userUpdateRequestDto.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(userUpdateRequestDto.getAvatarUrl());
        }
        if (userUpdateRequestDto.getCredits() != null) {
            existingUser.setCredits(userUpdateRequestDto.getCredits());
        }
        if (userUpdateRequestDto.getSubscriptionTier() != null) {
            existingUser.setSubscriptionTier(userUpdateRequestDto.getSubscriptionTier());
        }
        if (userUpdateRequestDto.getIsActive() != null) {
            existingUser.setIsActive(userUpdateRequestDto.getIsActive());
        }
        if (userUpdateRequestDto.getEmailVerified() != null) {
            existingUser.setEmailVerified(userUpdateRequestDto.getEmailVerified());
        }
        
        return userRepository.save(existingUser);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
} 