package org.kh.neuralpix.controller;

import org.kh.neuralpix.model.ImageLike;
import org.kh.neuralpix.service.ImageLikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/image-likes")
public class ImageLikeController {

    private final ImageLikeService service;

    @Autowired
    public ImageLikeController(ImageLikeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ImageLike>> getAllLikes() {
        return ResponseEntity.ok(service.getAllLikes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImageLike> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/image/{imageId}")
    public ResponseEntity<List<ImageLike>> getByImageId(@PathVariable Long imageId) {
        return ResponseEntity.ok(service.getLikesByImageId(imageId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ImageLike>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getLikesByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<ImageLike> likeImage(@RequestBody ImageLike imageLike) {
        return ResponseEntity.ok(service.likeImage(imageLike));
    }

    @DeleteMapping
    public ResponseEntity<Void> unlikeImage(@RequestParam Long userId, @RequestParam Long imageId) {
        service.unlikeImage(userId, imageId);
        return ResponseEntity.noContent().build();
    }
}
