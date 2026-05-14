package com.example.demo.DTO;

import com.example.demo.enums.UserRole;

/**
 * UserDTO
 * --------
 * Data Transfer Object used to send/receive
 * user data between Controller and Service layers.
 */
public class UserDTO {

    private Long userID;
    private String name;
    private String role;
    private String email;
    private String phone;
    private String status;
    private String password;

    /** Default constructor */
    public UserDTO() {}

    /** Parameterized constructor */
    public UserDTO(Long userID, String name, String role,
                    String email, String phone, String status, String password) {
        this.userID = userID;
        this.name = name;
        this.role = role;
        this.email = email;
        this.phone = phone;
        this.status = status;
        this.password = password;
    }

    // Getters and Setters

    public Long getUserID() { return userID; }
    public void setUserID(Long userID) { this.userID = userID; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}