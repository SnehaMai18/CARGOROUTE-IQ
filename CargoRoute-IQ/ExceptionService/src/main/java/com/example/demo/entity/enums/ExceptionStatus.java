package com.example.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ExceptionStatus {
	PENDING,
    IN_REVIEW,
    RESOLVED,
    REJECTED;

    @JsonCreator
    public static ExceptionStatus fromValue(String value) {
        if (value == null) return null;
        try {
            return ExceptionStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid exception status '" + value + "'. Valid values are: "
                + java.util.Arrays.stream(ExceptionStatus.values())
                        .map(Enum::name)
                        .collect(java.util.stream.Collectors.joining(", "))
            );
        }
    }
}
