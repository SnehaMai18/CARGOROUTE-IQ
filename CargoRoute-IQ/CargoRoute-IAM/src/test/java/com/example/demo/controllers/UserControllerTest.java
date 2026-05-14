package com.example.demo.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.demo.DTO.UserDTO;
import com.example.demo.enums.UserRole;
import com.example.demo.services.UserService;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController controller;

    @Test
    void saveUser_returnsCreatedResponse() {
        UserDTO request = new UserDTO(1L, "A", "Admin", "a@mail.com", "100", "Active", "pwd");
        when(userService.createUser(request)).thenReturn(request);

        ResponseEntity<UserDTO> response = controller.createUser(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("A", response.getBody().getName());
    }

    @Test
    void getAllUsers_returnsOkResponse() {
        when(userService.getAllUsers()).thenReturn(List.of(
                new UserDTO(1L, "A","Admin", "a@mail.com", "100", "Active", "p"),
                new UserDTO(2L, "B", "Driver", "b@mail.com", "200", "Active", "p")));

        ResponseEntity<List<UserDTO>> response = controller.getAllUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
    }

    @Test
    void getUserById_returnsOkResponse() {
        UserDTO user = new UserDTO(7L, "U7", "Analyst", "u7@mail.com", "700", "Active", "p");
        when(userService.getUserById(7L)).thenReturn(user);

        ResponseEntity<UserDTO> response = controller.getUserById(7L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("U7", response.getBody().getName());
    }

    @ParameterizedTest(name = "save endpoint case {0}")
    @MethodSource("userCases")
    void saveUser_parameterizedCases(int i) {
        UserDTO request = new UserDTO((long) i, "User" + i, "Driver", "u" + i + "@mail.com", "9" + i, "Active", "pwd");
        when(userService.createUser(request)).thenReturn(request);

        ResponseEntity<UserDTO> response = controller.createUser(request);

        assertNotNull(response.getBody());
        assertEquals("User" + i, response.getBody().getName());
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
    }

    @ParameterizedTest(name = "get by id case {0}")
    @MethodSource("idCases")
    void getUserById_parameterizedCases(long id) {
        UserDTO user = new UserDTO(id, "Name" + id, "Dispatcher", "n" + id + "@mail.com", "900", "Active", "p");
        when(userService.getUserById(id)).thenReturn(user);

        ResponseEntity<UserDTO> response = controller.getUserById(id);

        assertEquals(id, response.getBody().getUserID());
        assertTrue(response.getBody().getEmail().contains("@mail.com"));
    }

    private static Stream<Arguments> userCases() {
        return IntStream.rangeClosed(1, 5).mapToObj(Arguments::of);
    }

    private static Stream<Arguments> idCases() {
        return Stream.of(1L, 2L, 3L, 4L, 5L).map(Arguments::of);
    }
}
