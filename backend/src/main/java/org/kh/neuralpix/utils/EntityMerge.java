package org.kh.neuralpix.utils;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;
@Component
public class EntityMerge {

    /**
     * Merges non-null properties from a source object (typically a DTO)
     * into a target object (typically an existing entity).
     *
     * This method copies all properties from 'source' to 'target' that have
     * matching names and types, but it skips properties in 'source' that are null.
     * This is ideal for partial updates where the DTO might only contain fields
     * that are intended to be changed.
     *
     * @param source The object containing the updated data (e.g., a DTO instance).
     * @param target The existing object to be updated (e.g., an entity instance).
     * @param <S> The type of the source object.
     * @param <T> The type of the target object.
     * @return The updated target object (same instance as the input target).
     */
    public static <S, T> T merge(S source, T target) {
        if (source == null) {
            throw new IllegalArgumentException("Source object for merge cannot be null.");
        }
        if (target == null) {
            throw new IllegalArgumentException("Target object for merge cannot be null.");
        }

        // Use Spring's BeanUtils to copy properties, ignoring null values from the source
        BeanUtils.copyProperties(source, target, getNullPropertyNames(source));

        return target;
    }

    /**
     * Helper method to get the names of properties with null values in a given object.
     * This is used by `merge` to determine which properties to ignore during copying,
     * ensuring that nulls from the DTO don't overwrite existing values in the entity.
     *
     * @param source The object to inspect for null properties.
     * @return An array of property names that have null values.
     */
    private static String[] getNullPropertyNames(Object source) {
        final BeanWrapper src = new BeanWrapperImpl(source);
        java.beans.PropertyDescriptor[] pds = src.getPropertyDescriptors();

        Set<String> emptyNames = new HashSet<>();
        for (java.beans.PropertyDescriptor pd : pds) {
            // Ignore 'class' property that BeanWrapperImpl might return
            if (pd.getName().equals("class")) {
                continue;
            }
            Object srcValue = src.getPropertyValue(pd.getName());
            if (srcValue == null) {
                emptyNames.add(pd.getName());
            }
        }
        String[] result = new String[emptyNames.size()];
        return emptyNames.toArray(result);
    }
}
