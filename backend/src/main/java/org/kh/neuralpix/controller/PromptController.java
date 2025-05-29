package org.kh.neuralpix.controller;

import org.kh.neuralpix.model.Prompt;
import org.kh.neuralpix.service.PromptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prompts")
public class PromptController {

    private final PromptService service;

    @Autowired
    public PromptController(PromptService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Prompt>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prompt> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Prompt>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getByUserId(userId));
    }

    @GetMapping("/public")
    public ResponseEntity<List<Prompt>> getPublicPrompts() {
        return ResponseEntity.ok(service.getPublicPrompts());
    }

    @GetMapping("/favorite/{userId}")
    public ResponseEntity<List<Prompt>> getFavoritePromptsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getFavoritePromptsByUser(userId));
    }

    @PostMapping
    public ResponseEntity<Prompt> create(@RequestBody Prompt prompt) {
        return ResponseEntity.ok(service.create(prompt));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prompt> update(@PathVariable Long id, @RequestBody Prompt prompt) {
        return ResponseEntity.ok(service.update(id, prompt));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
