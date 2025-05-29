package org.kh.neuralpix.controller;

import org.kh.neuralpix.model.Collection;
import org.kh.neuralpix.service.CollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
public class CollectionController {

    private final CollectionService collectionService;

    @Autowired
    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping
    public ResponseEntity<List<Collection>> getAllCollections() {
        return ResponseEntity.ok(collectionService.getAllCollections());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Collection> getCollectionById(@PathVariable Long id) {
        return collectionService.getCollectionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Collection> createCollection(@RequestBody Collection collection) {
        return ResponseEntity.ok(collectionService.createCollection(collection));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Collection> updateCollection(
            @PathVariable Long id,
            @RequestBody Collection collection) {
        return ResponseEntity.ok(collectionService.updateCollection(id, collection));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCollection(@PathVariable Long id) {
        collectionService.deleteCollection(id);
        return ResponseEntity.noContent().build();
    }
}
