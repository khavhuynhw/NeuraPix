package org.kh.neuralpix.controller;

import jakarta.validation.Valid;
import org.kh.neuralpix.dto.UserDto;
import org.kh.neuralpix.dto.users.PagedUserResponse;
import org.kh.neuralpix.dto.users.UserCreateRequestDto;
import org.kh.neuralpix.dto.users.UserUpdateRequestDto;
import org.kh.neuralpix.service.CloudinaryService;
import org.kh.neuralpix.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;
    private final CloudinaryService cloudinaryService;

    @Autowired
    public UserController(UserService userService, CloudinaryService cloudinaryService) {
        this.userService = userService;
        this.cloudinaryService = cloudinaryService;
    }

    @GetMapping
    public ResponseEntity<PagedUserResponse> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String plan
    ) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<UserDto> userPage = userService.findUsersWithFilters(search, role, status, plan, pageable);
        PagedUserResponse response = PagedUserResponse.builder()
                .users(userPage.getContent())
                .total(userPage.getTotalElements())
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        return userService.findByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDto> getUserByEmail(@PathVariable String email) {
        return userService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserCreateRequestDto userCreateRequestDto) {
        if (userService.existsByEmail(userCreateRequestDto.getEmail())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(userService.create(userCreateRequestDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateRequestDto userUpdateRequestDto) {
        try {
            return ResponseEntity.ok(userService.update(id, userUpdateRequestDto));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // Check if file is an image
            String contentType = file.getContentType();
            List<String> allowedTypes = Arrays.asList("image/jpeg", "image/png", "image/gif", "image/webp");
            if (contentType == null || !allowedTypes.contains(contentType)) {
                return ResponseEntity.badRequest().body("Only image files are allowed (JPEG, PNG, GIF, WebP)");
            }

            // Check file size (5MB limit)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body("File size must be less than 5MB");
            }

            // Upload to Cloudinary in avatars folder
            CompletableFuture<String> uploadFuture = cloudinaryService.uploadImage(file, "avatars");

            // Wait for upload to complete
            String avatarUrl = uploadFuture.get();

            // Update user's avatar URL
            UserDto updatedUser = userService.updateUserAvatar(id, avatarUrl);

            return ResponseEntity.ok(updatedUser);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to upload avatar: " + e.getMessage());
        }
    }
}