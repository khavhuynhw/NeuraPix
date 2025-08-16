package org.kh.neuralpix.dto.vertexai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VertexAIImageRequest {
    
    private String prompt;
    private String negativePrompt;
    private Integer numberOfImages;
    private String aspectRatio;
    private Integer seed;
    private String guidanceScale;
    private String baseImage;
    private String maskImage;
    private String mode;
    private String language;
    private Boolean addWatermark;
    private String safetyFilterLevel;
    private String personGeneration;
    
    public VertexAIImageRequest(String prompt) {
        this.prompt = prompt;
        this.numberOfImages = 1;
        this.aspectRatio = "1:1";
        this.addWatermark = false;
        this.safetyFilterLevel = "block_some";
        this.personGeneration = "allow_adult";
        this.language = "auto";
        this.mode = "text-to-image";
    }
}