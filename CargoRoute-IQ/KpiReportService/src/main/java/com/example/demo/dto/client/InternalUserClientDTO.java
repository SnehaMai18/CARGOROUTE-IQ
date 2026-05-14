package com.example.demo.dto.client;

/**
 * Local mirror of IAM service's InternalUserDTO.
 */
public class InternalUserClientDTO {

    private Long userID;
    private String name;
    private String email;
    private String role;

    public InternalUserClientDTO() {}

    public Long getUserID() { return userID; }
    public void setUserID(Long userID) { this.userID = userID; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
