package org.kh.neuralpix.repository;

import org.kh.neuralpix.model.CollectionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollectionImageRepository extends JpaRepository<CollectionImage, Long> {
    List<CollectionImage> findByCollectionId(Long collectionId);
}
