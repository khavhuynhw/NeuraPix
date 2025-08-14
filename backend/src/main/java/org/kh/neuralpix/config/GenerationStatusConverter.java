package org.kh.neuralpix.config;

import org.kh.neuralpix.model.enums.GenerationStatus;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA Converter to handle GenerationStatus enum persistence
 * Ensures enum values are stored as lowercase in the database
 */
@Converter(autoApply = true)
public class GenerationStatusConverter implements AttributeConverter<GenerationStatus, String> {

    @Override
    public String convertToDatabaseColumn(GenerationStatus status) {
        if (status == null) {
            return null;
        }
        return status.getValue();
    }

    @Override
    public GenerationStatus convertToEntityAttribute(String dbValue) {
        if (dbValue == null || dbValue.trim().isEmpty()) {
            return null;
        }
        
        // Handle both uppercase and lowercase values for backward compatibility
        String normalizedValue = dbValue.toLowerCase().trim();
        
        switch (normalizedValue) {
            case "pending":
                return GenerationStatus.PENDING;
            case "generating":
            case "processing": // Handle legacy value
                return GenerationStatus.GENERATING;
            case "completed":
                return GenerationStatus.COMPLETED;
            case "failed":
                return GenerationStatus.FAILED;
            default:
                throw new IllegalArgumentException("Unknown GenerationStatus value: " + dbValue);
        }
    }
}
