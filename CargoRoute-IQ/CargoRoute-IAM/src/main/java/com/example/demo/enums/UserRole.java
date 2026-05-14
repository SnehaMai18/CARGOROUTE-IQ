package com.example.demo.enums;

import com.example.demo.exceptions.InvalidUserRoleException;

public enum UserRole {
    Shipper,
    Dispatcher,
    FleetManager,
    Driver,
    WarehouseManager,
    BillingClerk,
    Admin,
    Analyst;

	public static UserRole from(String value) {
	    try {
	        return UserRole.valueOf(value);
	    } catch (Exception ex) {
	        throw new InvalidUserRoleException(
	            "Invalid role provided: " + value
	        );
	    }
	}
}