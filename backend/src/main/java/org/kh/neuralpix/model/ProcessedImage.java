package org.kh.neuralpix.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "processed_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessedImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "original_url", length = 2048)
    private String originalUrl;

    @Column(name = "processed_url", length = 2048, nullable = false)
    private String processedUrl;

    @Column(name = "imgur_url", length = 2048)
    private String imgurUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false)
    private OperationType operationType;

    @Column(name = "prompt", length = 2000)
    private String prompt;

    @Column(name = "style", length = 100)
    private String style;

    @Column(name = "quality", length = 50)
    private String quality;

    @Column(name = "scale_factor")
    private Double scaleFactor;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Column(name = "format", length = 10)
    private String format;

    @Column(name = "processing_time_ms")
    private Long processingTimeMs;

    @Column(name = "api_cost")
    private Double apiCost;

    @Column(name = "success", nullable = false)
    private Boolean success;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "tags", length = 500)
    private String tags;

    @Column(name = "is_public")
    private Boolean isPublic = false;

    @Column(name = "is_favorite")
    private Boolean isFavorite = false;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum OperationType {
        GENERATE_IMAGE,
        REMOVE_BACKGROUND,
        GENERATE_BACKGROUND,
        UPSCALE_IMAGE,
        OTHER
    }
}