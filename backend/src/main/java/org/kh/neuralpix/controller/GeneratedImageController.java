package org.kh.neuralpix.controller;

import org.kh.neuralpix.dto.request.GeneratedImageRequestDto;
import org.kh.neuralpix.dto.response.GeneratedImageResponseDto;
import org.kh.neuralpix.model.GeneratedImage;
import org.kh.neuralpix.service.GeneratedImageService;
import org.kh.neuralpix.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = {"http://localhost:5173", "https://neura-pix-chi.vercel.app"}, allowCredentials = "true")
public class GeneratedImageController {

    private static final Logger logger = LoggerFactory.getLogger(GeneratedImageController.class);

    private final GeneratedImageService generatedImageService;
    private final UserService userService;

    @Autowired
    public GeneratedImageController(GeneratedImageService generatedImageService, UserService userService) {
        this.generatedImageService = generatedImageService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<GeneratedImageResponseDto>> getAllImages() {
        return ResponseEntity.ok(generatedImageService.getAllImagesDto());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GeneratedImageResponseDto> getImageById(@PathVariable Long id) {
        return generatedImageService.getImageByIdDto(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GeneratedImageResponseDto>> getImagesByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(generatedImageService.getImagesByUserIdDto(userId));
    }

    @GetMapping("/user/me")
    public ResponseEntity<List<GeneratedImageResponseDto>> getMyImages(Authentication authentication) {
        try {
            logger.info("Fetching images for user: {}", authentication.getName());
            
            Long userId = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + authentication.getName()))
                    .getId();
            
            logger.info("Found user with ID: {}", userId);
            
            List<GeneratedImageResponseDto> images = generatedImageService.getImagesByUserIdDto(userId);
            logger.info("Found {} images for user: {}", images.size(), authentication.getName());
            
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            logger.error("Error fetching images for user: {}", authentication.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/prompt/{promptId}")
    public ResponseEntity<List<GeneratedImage>> getImagesByPromptId(@PathVariable Long promptId) {
        return ResponseEntity.ok(generatedImageService.findByPromptId(promptId));
    }

    @GetMapping("/public")
    public ResponseEntity<List<GeneratedImageResponseDto>> getPublicImages() {
        return ResponseEntity.ok(generatedImageService.getPublicImagesDto());
    }

    @PostMapping
    public ResponseEntity<GeneratedImageResponseDto> createImage(@RequestBody GeneratedImageRequestDto requestDto, 
                                                                Authentication authentication) {
        try {
            Long userId = userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    .getId();
            
            GeneratedImageResponseDto responseDto = generatedImageService.createImage(requestDto, userId);
            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            logger.error("Error creating image for user: {}", authentication.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<GeneratedImageResponseDto> updateImage(@PathVariable Long id, 
                                                               @RequestBody GeneratedImageRequestDto requestDto) {
        try {
            GeneratedImageResponseDto responseDto = generatedImageService.updateImageDto(id, requestDto);
            return ResponseEntity.ok(responseDto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        generatedImageService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likeImage(@PathVariable Long id) {
        generatedImageService.incrementLikesCount(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/download")
    public ResponseEntity<Void> downloadImage(@PathVariable Long id) {
        generatedImageService.incrementDownloadsCount(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<Void> viewImage(@PathVariable Long id) {
        generatedImageService.incrementViewsCount(id);
        return ResponseEntity.ok().build();
    }
} 