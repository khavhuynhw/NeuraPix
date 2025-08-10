package org.kh.neuralpix.controller;

import org.kh.neuralpix.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @Autowired
    private FileUploadService fileUploadService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            String fileName = fileUploadService.uploadFile(file);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("fileName", fileName);
            response.put("originalName", file.getOriginalFilename());
            response.put("size", file.getSize());
            response.put("contentType", file.getContentType());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/download/{fileName}")
    public ResponseEntity<?> downloadFile(@PathVariable String fileName) {
        try {
            return fileUploadService.downloadFile(fileName);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error downloading file: " + e.getMessage());
        }
    }

    @DeleteMapping("/{fileName}")
    public ResponseEntity<?> deleteFile(@PathVariable String fileName) {
        try {
            boolean deleted = fileUploadService.deleteFile(fileName);
            Map<String, Object> response = new HashMap<>();
            response.put("success", deleted);
            response.put("message", deleted ? "File deleted successfully" : "File not found");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting file: " + e.getMessage());
        }
    }
}