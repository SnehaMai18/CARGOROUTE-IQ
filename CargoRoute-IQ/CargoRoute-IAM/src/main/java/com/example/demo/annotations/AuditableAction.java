package com.example.demo.annotations;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import com.example.demo.enums.AuditAction;
import com.example.demo.enums.AuditResourceType;

/**
 * Marks a service method for automatic audit logging via AOP.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditableAction {

    AuditAction action();

    AuditResourceType resourceType();

    String details() default "";

    int resourceIdArgIndex() default -1;
}
