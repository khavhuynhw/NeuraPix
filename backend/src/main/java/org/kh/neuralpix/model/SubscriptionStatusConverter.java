package org.kh.neuralpix.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class SubscriptionStatusConverter implements AttributeConverter<Subscription.SubscriptionStatus, String> {

    @Override
    public String convertToDatabaseColumn(Subscription.SubscriptionStatus attribute) {
        return attribute == null ? null : attribute.name().toLowerCase();
    }

    @Override
    public Subscription.SubscriptionStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : Subscription.SubscriptionStatus.valueOf(dbData.toUpperCase());
    }
}
