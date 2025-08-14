package org.kh.neuralpix.config;

import org.junit.jupiter.api.Test;
import org.kh.neuralpix.model.enums.GenerationStatus;

import static org.junit.jupiter.api.Assertions.*;

class GenerationStatusConverterTest {

    private final GenerationStatusConverter converter = new GenerationStatusConverter();

    @Test
    void testConvertToDatabaseColumn() {
        assertEquals("pending", converter.convertToDatabaseColumn(GenerationStatus.PENDING));
        assertEquals("generating", converter.convertToDatabaseColumn(GenerationStatus.GENERATING));
        assertEquals("completed", converter.convertToDatabaseColumn(GenerationStatus.COMPLETED));
        assertEquals("failed", converter.convertToDatabaseColumn(GenerationStatus.FAILED));
        assertNull(converter.convertToDatabaseColumn(null));
    }

    @Test
    void testConvertToEntityAttribute() {
        assertEquals(GenerationStatus.PENDING, converter.convertToEntityAttribute("pending"));
        assertEquals(GenerationStatus.GENERATING, converter.convertToEntityAttribute("generating"));
        assertEquals(GenerationStatus.COMPLETED, converter.convertToEntityAttribute("completed"));
        assertEquals(GenerationStatus.FAILED, converter.convertToEntityAttribute("failed"));
        assertNull(converter.convertToEntityAttribute(null));
        assertNull(converter.convertToEntityAttribute(""));
        assertNull(converter.convertToEntityAttribute("   "));
    }

    @Test
    void testConvertToEntityAttributeWithUppercase() {
        // Test backward compatibility with uppercase values
        assertEquals(GenerationStatus.PENDING, converter.convertToEntityAttribute("PENDING"));
        assertEquals(GenerationStatus.GENERATING, converter.convertToEntityAttribute("GENERATING"));
        assertEquals(GenerationStatus.COMPLETED, converter.convertToEntityAttribute("COMPLETED"));
        assertEquals(GenerationStatus.FAILED, converter.convertToEntityAttribute("FAILED"));
    }

    @Test
    void testConvertToEntityAttributeWithLegacyProcessing() {
        // Test backward compatibility with legacy "processing" value
        assertEquals(GenerationStatus.GENERATING, converter.convertToEntityAttribute("processing"));
        assertEquals(GenerationStatus.GENERATING, converter.convertToEntityAttribute("PROCESSING"));
    }

    @Test
    void testConvertToEntityAttributeWithInvalidValue() {
        assertThrows(IllegalArgumentException.class, () -> {
            converter.convertToEntityAttribute("invalid");
        });
    }

    @Test
    void testConvertToEntityAttributeWithWhitespace() {
        assertEquals(GenerationStatus.PENDING, converter.convertToEntityAttribute("  pending  "));
        assertEquals(GenerationStatus.GENERATING, converter.convertToEntityAttribute("\tgenerating\n"));
    }
}
