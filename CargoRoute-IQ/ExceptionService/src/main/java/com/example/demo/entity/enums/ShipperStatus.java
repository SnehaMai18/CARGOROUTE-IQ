package com.example.demo.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum ShipperStatus {
	ACTIVE,
    INACTIVE,
    SUSPENDED;

    @JsonCreator
    public static ShipperStatus fromValue(String value) {
        if (value == null) return null;
        try {
            return ShipperStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid shipper status '" + value + "'. Valid values are: "
                + java.util.Arrays.stream(ShipperStatus.values())
                        .map(Enum::name)
                        .collect(java.util.stream.Collectors.joining(", "))
            );
        }
    }
}
