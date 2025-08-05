package org.kh.neuralpix.dto.pixelcut;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PixelCutImageGenerationRequest {
    private String prompt;
    private String negativePrompt;
    private String model;
    private Integer width;
    private Integer height;
    private Integer steps;
    private BigDecimal scale;
    private Long seed;
    private String style;
    private Integer numImages;
    private String quality;
    private String format;
} 