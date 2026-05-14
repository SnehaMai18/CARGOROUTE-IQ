package com.example.demo.entities;

import com.example.demo.enums.UserRole;
import jakarta.persistence.*;

/**
 * User Entity
 * -------------
 * This class represents the "users" table in the database.
 * It is a JPA entity and is used for ORM (Object Relational Mapping).
 */
@Entity
public class User {

    /**
     * Primary Key for User table
     * Auto-generated using IDENTITY strategy (database auto-increment)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userID;
    private String name;

    /**
     * Role of the user (Enum)
     * Stored as STRING in the database (e.g., ADMIN, DRIVER)
     */
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    //Email address of the user (used for login)
    private String email;
    private String phone;
    private String status;

    //Encrypted password stored in the database
    private String password;


    //Default constructor (required by JPA)
    public User() {}

    /**
     * Parameterized constructor
     * Used to create full User object
     */
    public User(Long userID, String name, UserRole role,
                 String email, String phone, String status, String password) {
        this.userID = userID;
        this.name = name;
        this.role = role;
        this.email = email;
        this.phone = phone;
        this.status = status;
        this.password = password;
    }

    // ----------- Getters and Setters -----------

    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}