package com.example.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum BookingStatus {
    SUBMITTED,
    PLANNED,
    DISPATCHED,
    IN_TRANSIT,
    DELIVERED,
    CANCELLED;

    @JsonCreator
    public static BookingStatus fromValue(String value) {
        if (value == null) return null;
        try {
            return BookingStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid booking status '" + value + "'. Valid values are: "
                + java.util.Arrays.stream(BookingStatus.values())
                        .map(Enum::name)
                        .collect(java.util.stream.Collectors.joining(", "))
            );
        }
    }
}
