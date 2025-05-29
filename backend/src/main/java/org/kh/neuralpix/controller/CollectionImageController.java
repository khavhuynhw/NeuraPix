package org.kh.neuralpix.controller;

import org.kh.neuralpix.model.CollectionImage;
import org.kh.neuralpix.service.CollectionImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collection-images")
public class CollectionImageController {

    private final CollectionImageService service;

    @Autowired
    public CollectionImageController(CollectionImageService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CollectionImage>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollectionImage> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/collection/{collectionId}")
    public ResponseEntity<List<CollectionImage>> getByCollectionId(@PathVariable Long collectionId) {
        return ResponseEntity.ok(service.getByCollectionId(collectionId));
    }

    @PostMapping
    public ResponseEntity<CollectionImage> create(@RequestBody CollectionImage collectionImage) {
        return ResponseEntity.ok(service.create(collectionImage));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
