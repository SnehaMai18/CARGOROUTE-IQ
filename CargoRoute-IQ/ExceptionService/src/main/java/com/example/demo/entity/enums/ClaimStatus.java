package com.example.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ClaimStatus {
	OPEN,
    UNDER_REVIEW,
    SETTLED,
    DENIED,
    CANCELLED;

    @JsonCreator
    public static ClaimStatus fromValue(String value) {
        if (value == null) return null;
        try {
            return ClaimStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid claim status '" + value + "'. Valid values are: "
                + java.util.Arrays.stream(ClaimStatus.values())
                        .map(Enum::name)
                        .collect(java.util.stream.Collectors.joining(", "))
            );
        }
    }
}
