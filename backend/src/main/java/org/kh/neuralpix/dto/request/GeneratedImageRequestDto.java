package org.kh.neuralpix.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;
import org.hibernate.validator.constraints.URL;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedImageRequestDto {
    
    private Long promptId;
    
    @NotBlank(message = "Image URL is required")
    @URL(message = "Image URL must be valid")
    private String imageUrl;
    
    @URL(message = "Thumbnail URL must be valid")
    private String thumbnailUrl;
    
    @Min(value = 0, message = "File size cannot be negative")
    private Integer fileSize;
    
    @DecimalMin(value = "0.0", message = "Generation time cannot be negative")
    private BigDecimal generationTime;
    
    private String status;
    
    private String errorMessage;
    
    @Builder.Default
    private Boolean isPublic = false;
}
