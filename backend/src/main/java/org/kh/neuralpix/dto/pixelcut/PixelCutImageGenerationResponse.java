package org.kh.neuralpix.dto.pixelcut;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PixelCutImageGenerationResponse {
    private String status;
    private String taskId;
    private List<GeneratedImageData> images;
    private String error;
    private Long generationTime;
    private boolean success;
    private String errorMessage;
    private List<String> imageUrls;
    
    public boolean isSuccess() {
        return success;
    }
    
    public List<String> getImageUrls() {
        return imageUrls;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GeneratedImageData {
        private String imageUrl;
        private String thumbnailUrl;
        private Integer fileSize;
        private String format;
        private Integer width;
        private Integer height;
    }
} 