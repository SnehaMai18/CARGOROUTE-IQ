package com.example.demo.serviceimpl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.DTO.UserDTO;
import com.example.demo.DTO.UserUpdateDTO;
import com.example.demo.annotations.AuditableAction;
import com.example.demo.entities.User;
import com.example.demo.enums.AuditAction;
import com.example.demo.enums.AuditResourceType;
import com.example.demo.enums.UserRole;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.UserService;
import com.example.demo.exceptions.InvalidCredentialsException;
import com.example.demo.exceptions.ResourceNotFoundException;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // SAVE / UPDATE USER
    @Override
//    @AuditableAction(action = AuditAction.CREATE, resourceType = AuditResourceType.USER, details = "User registered by admin")
    public UserDTO createUser(UserDTO userDTO) {
    	
    	if (userRepository.findByEmail(userDTO.getEmail()) != null) {
            throw new InvalidCredentialsException(
                    "Email already exists. Please use a different email."
            );
        }

        User user = new User();
        user.setUserID(userDTO.getUserID());
        user.setName(userDTO.getName());
        user.setRole(UserRole.from(userDTO.getRole()));
        user.setEmail(userDTO.getEmail());
        user.setPhone(userDTO.getPhone());
        user.setStatus(userDTO.getStatus() != null ? userDTO.getStatus() : "Active");

        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

        User savedUser = userRepository.save(user);

        return mapToDTO(savedUser);
    }

    // GET ALL USERS
    @Override
    public List<UserDTO> getAllUsers() {

        List<User> users = userRepository.findAll();
        List<UserDTO> dtoList = new ArrayList<>();

        for (User user : users) {
            dtoList.add(mapToDTO(user));
        }

        return dtoList;
    }

    // GET USER BY ID
    @Override
    public UserDTO getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        return mapToDTO(user);
    }

    // ENTITY → DTO CONVERTER
    private UserDTO mapToDTO(User user) {

        UserDTO dto = new UserDTO();
        dto.setUserID(user.getUserID());
        dto.setName(user.getName());

        // ✅ Convert enum → string
        dto.setRole(user.getRole().name());

        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setStatus(user.getStatus());

        return dto;
    }
    
    
    @Override
//    @AuditableAction(action = AuditAction.UPDATE, resourceType = AuditResourceType.USER, details = "User profile updated", resourceIdArgIndex = 0)
    public UserDTO updateUser(Long userId, UserUpdateDTO dto) {

        User user = userRepository.findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException("User not found: " + userId));

        if (dto.getRole() != null) {
            user.setRole(UserRole.from(dto.getRole()));
        }

        if (dto.getStatus() != null) {
            user.setStatus(dto.getStatus());
        }

        User updatedUser = userRepository.save(user);

        return mapToDTO(updatedUser);
    }

}
