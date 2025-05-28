package org.kh.neuralpix.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "collection_images", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"collection_id", "image_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CollectionImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "collection_id", nullable = false)
    private Long collectionId;

    @Column(name = "image_id", nullable = false)
    private Long imageId;

    @CreationTimestamp
    @Column(name = "added_at")
    private LocalDateTime addedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collection_id", insertable = false, updatable = false)
    private Collection collection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id", insertable = false, updatable = false)
    private GeneratedImage image;
}
