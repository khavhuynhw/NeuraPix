package org.kh.neuralpix.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.kh.neuralpix.model.enums.GenerationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedImageResponseDto {
    
    private Long id;
    private Long promptId;
    private Long userId;
    private String imageUrl;
    private String thumbnailUrl;
    private Integer fileSize;
    private BigDecimal generationTime;
    private GenerationStatus status;
    private String errorMessage;
    private Boolean isPublic;
    private Integer likesCount;
    private Integer downloadsCount;
    private Integer viewsCount;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields for work history
    private String username;
}
