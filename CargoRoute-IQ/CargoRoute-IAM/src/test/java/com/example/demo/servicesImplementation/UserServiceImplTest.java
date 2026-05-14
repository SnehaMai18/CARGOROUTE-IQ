package com.example.demo.servicesImplementation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.DTO.UserDTO;
import com.example.demo.entities.User;
import com.example.demo.enums.UserRole;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.UserRepository;
import com.example.demo.serviceimpl.UserServiceImpl;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl service;

    private UserDTO dto;
    private User entity;

    @BeforeEach
    void setUp() {
        dto = new UserDTO(1L, "A", "Admin", "a@a.com", "111", "Active", "raw");
        entity = new User(1L, "A", UserRole.Admin, "a@a.com", "111", "Active", "encoded");
    }

    @Test
    void saveUser_encodesPasswordAndReturnsMappedDto() {
        when(passwordEncoder.encode("raw")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(entity);

        UserDTO result = service.createUser(dto);

        assertEquals("encoded", result.getPassword());
        assertEquals("A", result.getName());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void getAllUsers_returnsMappedList() {
        List<User> users = List.of(
                entity,
                new User(2L, "B", UserRole.Driver, "b@b.com", "222", "Inactive", "encoded2"));
        when(userRepository.findAll()).thenReturn(users);

        List<UserDTO> result = service.getAllUsers();

        assertEquals(2, result.size());
        assertEquals(UserRole.Driver, result.get(1).getRole());
    }

    @Test
    void getAllUsers_returnsEmptyListWhenNoData() {
        when(userRepository.findAll()).thenReturn(new ArrayList<>());

        List<UserDTO> result = service.getAllUsers();

        assertTrue(result.isEmpty());
    }

    @Test
    void getUserById_returnsMappedDto() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(entity));

        UserDTO result = service.getUserById(1L);

        assertEquals("A", result.getName());
        assertEquals("a@a.com", result.getEmail());
    }

    @Test
    void getUserById_throwsWhenMissing() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> service.getUserById(99L));

        assertTrue(ex.getMessage().contains("99"));
    }

//    @ParameterizedTest(name = "saveUser mapping case {index}")
//    @MethodSource("userInputs")
//    void saveUser_parameterizedMapping(Long id, String name, String role, String status, int index) {
//        UserDTO input = new UserDTO(id, name, role, "u" + index + "@mail.com", "9000" + index, status, "pwd" + index);
//        User saved = new User(id, name, role, "u" + index + "@mail.com", "9000" + index, status, "enc" + index);
//
//        when(passwordEncoder.encode("pwd" + index)).thenReturn("enc" + index);
//        when(userRepository.save(any(User.class))).thenReturn(saved);
//
//        UserDTO output = service.saveUser(input);
//
//        assertNotNull(output);
//        assertEquals(name, output.getName());
//        assertEquals(role, output.getRole());
//        assertEquals(status, output.getStatus());
//    }

    private static Stream<Arguments> userInputs() {
        UserRole[] roles = UserRole.values();
        return IntStream.rangeClosed(1, 15)
                .mapToObj(i -> Arguments.of((long) i, "User" + i, roles[i % roles.length], i % 2 == 0 ? "Active" : "Inactive", i));
    }
}
