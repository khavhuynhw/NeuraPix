package org.kh.neuralpix.mapper;

import org.kh.neuralpix.dto.request.GeneratedImageRequestDto;
import org.kh.neuralpix.dto.response.GeneratedImageResponseDto;
import org.kh.neuralpix.dto.response.WorkHistoryResponseDto;
import org.kh.neuralpix.model.GeneratedImage;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class GeneratedImageMapper {
    
    public GeneratedImage toEntity(GeneratedImageRequestDto dto, Long userId) {
        GeneratedImage entity = new GeneratedImage();
        entity.setPromptId(dto.getPromptId());
        entity.setUserId(userId);
        entity.setImageUrl(dto.getImageUrl());
        entity.setThumbnailUrl(dto.getThumbnailUrl());
        entity.setFileSize(dto.getFileSize());
        entity.setGenerationTime(dto.getGenerationTime());
        
        if (dto.getStatus() != null) {
            try {
                // Map status string to enum
                String statusValue = dto.getStatus().toLowerCase().trim();
                switch (statusValue) {
                    case "pending":
                        entity.setStatus(org.kh.neuralpix.model.enums.GenerationStatus.PENDING);
                        break;
                    case "generating":
                    case "processing": // Handle legacy value
                        entity.setStatus(org.kh.neuralpix.model.enums.GenerationStatus.GENERATING);
                        break;
                    case "completed":
                        entity.setStatus(org.kh.neuralpix.model.enums.GenerationStatus.COMPLETED);
                        break;
                    case "failed":
                        entity.setStatus(org.kh.neuralpix.model.enums.GenerationStatus.FAILED);
                        break;
                    default:
                        entity.setStatus(org.kh.neuralpix.model.enums.GenerationStatus.PENDING);
                        break;
                }
            } catch (Exception e) {
                entity.setStatus(org.kh.neuralpix.model.enums.GenerationStatus.PENDING);
            }
        }
        
        entity.setErrorMessage(dto.getErrorMessage());
        entity.setIsPublic(dto.getIsPublic());
        
        return entity;
    }
    
    public GeneratedImageResponseDto toDto(GeneratedImage entity) {
        GeneratedImageResponseDto dto = new GeneratedImageResponseDto();
        dto.setId(entity.getId());
        dto.setPromptId(entity.getPromptId());
        dto.setUserId(entity.getUserId());
        dto.setImageUrl(entity.getImageUrl());
        dto.setThumbnailUrl(entity.getThumbnailUrl());
        dto.setFileSize(entity.getFileSize());
        dto.setGenerationTime(entity.getGenerationTime());
        dto.setStatus(entity.getStatus());
        dto.setErrorMessage(entity.getErrorMessage());
        dto.setIsPublic(entity.getIsPublic());
        dto.setLikesCount(entity.getLikesCount());
        dto.setDownloadsCount(entity.getDownloadsCount());
        dto.setViewsCount(entity.getViewsCount());
        dto.setIsDeleted(entity.getIsDeleted());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        
        // Set additional fields if available
        if (entity.getUser() != null) {
            dto.setUsername(entity.getUser().getUsername());
        }
        
        return dto;
    }
    
    public List<GeneratedImageResponseDto> toDtoList(List<GeneratedImage> entities) {
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    public WorkHistoryResponseDto toWorkHistoryDto(Page<GeneratedImage> page) {
        List<GeneratedImageResponseDto> images = page.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        
        return WorkHistoryResponseDto.builder()
                .images(images)
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
