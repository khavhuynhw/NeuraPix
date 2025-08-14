package org.kh.neuralpix.model.enums;

public enum GenerationStatus {
    PENDING("pending"),
    GENERATING("generating"), 
    COMPLETED("completed"),
    FAILED("failed");

    private final String value;

    GenerationStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return this.value;
    }
}
