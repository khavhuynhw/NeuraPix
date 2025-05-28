package org.kh.neuralpix.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.validator.constraints.URL;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "generated_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prompt_id", nullable = false)
    private Long promptId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "image_url", nullable = false, length = 500)
    @NotBlank(message = "Image URL is required")
    @URL(message = "Image URL must be valid")
    private String imageUrl;

    @Column(name = "thumbnail_url", length = 500)
    @URL(message = "Thumbnail URL must be valid")
    private String thumbnailUrl;

    @Column(name = "file_size")
    @Min(value = 0, message = "File size cannot be negative")
    private Integer fileSize;

    @Column(name = "generation_time", precision = 5, scale = 2)
    @DecimalMin(value = "0.0", message = "Generation time cannot be negative")
    private BigDecimal generationTime;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('pending', 'generating', 'completed', 'failed') DEFAULT 'pending'")
    private GenerationStatus status = GenerationStatus.PENDING;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "is_public", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isPublic = false;

    @Column(name = "likes_count", columnDefinition = "INT DEFAULT 0")
    private Integer likesCount = 0;

    @Column(name = "downloads_count", columnDefinition = "INT DEFAULT 0")
    private Integer downloadsCount = 0;

    @Column(name = "views_count", columnDefinition = "INT DEFAULT 0")
    private Integer viewsCount = 0;

    @Column(name = "is_deleted", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prompt_id", insertable = false, updatable = false)
    private Prompt prompt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @OneToMany(mappedBy = "image", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ImageLike> imageLikes;

    @OneToMany(mappedBy = "image", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ImageTag> imageTags;

    @OneToMany(mappedBy = "image", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CollectionImage> collectionImages;
}
