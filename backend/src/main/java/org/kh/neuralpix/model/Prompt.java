package org.kh.neuralpix.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "prompts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prompt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "prompt_text", nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Prompt text is required")
    @Size(max = 1000, message = "Prompt text cannot exceed 1000 characters")
    private String promptText;

    @Column(name = "negative_prompt", columnDefinition = "TEXT")
    private String negativePrompt;

    @Column(length = 100)
    private String style;

    @Column(columnDefinition = "VARCHAR(100) DEFAULT 'stable-diffusion'")
    private String model = "stable-diffusion";

    @Column(columnDefinition = "INT DEFAULT 512")
    @Min(value = 256, message = "Width must be at least 256")
    @Max(value = 2048, message = "Width cannot exceed 2048")
    private Integer width = 512;

    @Column(columnDefinition = "INT DEFAULT 512")
    @Min(value = 256, message = "Height must be at least 256")
    @Max(value = 2048, message = "Height cannot exceed 2048")
    private Integer height = 512;

    @Column(columnDefinition = "INT DEFAULT 20")
    @Min(value = 1, message = "Steps must be at least 1")
    @Max(value = 150, message = "Steps cannot exceed 150")
    private Integer steps = 20;

    @Column(name = "guidance_scale", precision = 4, scale = 2, columnDefinition = "DECIMAL(4,2) DEFAULT 7.5")
    @DecimalMin(value = "1.0", message = "Guidance scale must be at least 1.0")
    @DecimalMax(value = "30.0", message = "Guidance scale cannot exceed 30.0")
    private BigDecimal guidanceScale = new BigDecimal("7.5");

    private Long seed;

    @Column(name = "is_public", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isPublic = false;

    @Column(name = "is_favorite", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isFavorite = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @OneToMany(mappedBy = "prompt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GeneratedImage> generatedImages;
}
