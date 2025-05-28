package org.kh.neuralpix.controller;

import org.kh.neuralpix.model.GeneratedImage;
import org.kh.neuralpix.service.GeneratedImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/images")
public class GeneratedImageController {

    private final GeneratedImageService generatedImageService;

    @Autowired
    public GeneratedImageController(GeneratedImageService generatedImageService) {
        this.generatedImageService = generatedImageService;
    }

    @GetMapping
    public ResponseEntity<List<GeneratedImage>> getAllImages() {
        return ResponseEntity.ok(generatedImageService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GeneratedImage> getImageById(@PathVariable Long id) {
        return generatedImageService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<GeneratedImage>> getImagesByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(generatedImageService.findByUserId(userId));
    }

    @GetMapping("/prompt/{promptId}")
    public ResponseEntity<List<GeneratedImage>> getImagesByPromptId(@PathVariable Long promptId) {
        return ResponseEntity.ok(generatedImageService.findByPromptId(promptId));
    }

    @GetMapping("/public")
    public ResponseEntity<List<GeneratedImage>> getPublicImages() {
        return ResponseEntity.ok(generatedImageService.findPublicImages());
    }

    @PostMapping
    public ResponseEntity<GeneratedImage> createImage(@RequestBody GeneratedImage image) {
        return ResponseEntity.ok(generatedImageService.save(image));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GeneratedImage> updateImage(@PathVariable Long id, @RequestBody GeneratedImage image) {
        try {
            return ResponseEntity.ok(generatedImageService.update(id, image));
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