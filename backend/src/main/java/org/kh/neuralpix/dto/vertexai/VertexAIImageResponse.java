package org.kh.neuralpix.dto.vertexai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VertexAIImageResponse {
    
    private boolean success;
    private String errorMessage;
    private List<GeneratedImageData> images;
    private String requestId;
    private Long processingTimeMs;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeneratedImageData {
        private String imageUrl;
        private String base64Data;
        private Integer width;
        private Integer height;
        private String format;
        private Integer fileSize;
        private String safetyRating;
    }
}