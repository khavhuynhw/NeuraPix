package org.kh.neuralpix.controller;

import org.kh.neuralpix.model.ImageTag;
import org.kh.neuralpix.service.ImageTagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/image-tags")
public class ImageTagController {

    private final ImageTagService service;

    @Autowired
    public ImageTagController(ImageTagService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ImageTag>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImageTag> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/image/{imageId}")
    public ResponseEntity<List<ImageTag>> getByImageId(@PathVariable Long imageId) {
        return ResponseEntity.ok(service.getByImageId(imageId));
    }

    @GetMapping("/tag/{tagId}")
    public ResponseEntity<List<ImageTag>> getByTagId(@PathVariable Long tagId) {
        return ResponseEntity.ok(service.getByTagId(tagId));
    }

    @PostMapping
    public ResponseEntity<ImageTag> create(@RequestBody ImageTag imageTag) {
        return ResponseEntity.ok(service.create(imageTag));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteByImageIdAndTagId(@RequestParam Long imageId, @RequestParam Long tagId) {
        service.deleteByImageIdAndTagId(imageId, tagId);
        return ResponseEntity.noContent().build();
    }
}
