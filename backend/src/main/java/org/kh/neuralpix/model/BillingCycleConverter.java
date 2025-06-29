package org.kh.neuralpix.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class BillingCycleConverter implements AttributeConverter<Subscription.BillingCycle, String> {

    @Override
    public String convertToDatabaseColumn(Subscription.BillingCycle attribute) {
        return attribute == null ? null : attribute.name().toLowerCase(); // e.g., MONTHLY → "monthly"
    }

    @Override
    public Subscription.BillingCycle convertToEntityAttribute(String dbData) {
        return dbData == null ? null : Subscription.BillingCycle.valueOf(dbData.toUpperCase()); // "monthly" → MONTHLY
    }
}
