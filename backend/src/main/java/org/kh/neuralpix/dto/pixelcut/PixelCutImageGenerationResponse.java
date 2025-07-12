package org.kh.neuralpix.dto.pixelcut;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PixelCutImageGenerationResponse {
    private String status;
    private String taskId;
    private List<GeneratedImageData> images;
    private String error;
    private Long generationTime;
    
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