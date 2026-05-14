package com.example.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ExceptionType {
	DELAY,
    DAMAGE,
    MISSING;

    @JsonCreator
    public static ExceptionType fromValue(String value) {
        if (value == null) return null;
        try {
            return ExceptionType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid exception type '" + value + "'. Valid values are: "
                + java.util.Arrays.stream(ExceptionType.values())
                        .map(Enum::name)
                        .collect(java.util.stream.Collectors.joining(", "))
            );
        }
    }
}
