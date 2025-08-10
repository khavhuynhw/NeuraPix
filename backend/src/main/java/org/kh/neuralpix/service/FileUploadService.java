package org.kh.neuralpix.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface FileUploadService {
    String uploadFile(MultipartFile file) throws Exception;
    ResponseEntity<?> downloadFile(String fileName) throws Exception;
    boolean deleteFile(String fileName) throws Exception;
}