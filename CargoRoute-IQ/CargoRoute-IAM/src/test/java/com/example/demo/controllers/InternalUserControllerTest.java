package com.example.demo.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import com.example.demo.DTO.InternalUserDTO;
import com.example.demo.entities.User;
import com.example.demo.enums.UserRole;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.UserRepository;

class InternalUserControllerTest {

    @Test
    void userExists_returnsTrue() {
        UserRepository repo = org.mockito.Mockito.mock(UserRepository.class);
        InternalUserController controller = new InternalUserController(repo);
        when(repo.existsById(1L)).thenReturn(true);

        Boolean result = controller.userExists(1L);

        assertTrue(result);
    }

    @Test
    void getUserInternal_returnsMappedDto() {
        UserRepository repo = org.mockito.Mockito.mock(UserRepository.class);
        InternalUserController controller = new InternalUserController(repo);

        User user = new User(7L, "U7", UserRole.Analyst, "u7@mail.com", "700", "Active", "p");
        when(repo.findById(7L)).thenReturn(Optional.of(user));

        InternalUserDTO dto = controller.getUserInternal(7L);

        assertEquals(7L, dto.getUserID());
        assertEquals("Analyst", dto.getRole());
    }

    @Test
    void getUserInternal_throwsWhenNotFound() {
        UserRepository repo = org.mockito.Mockito.mock(UserRepository.class);
        InternalUserController controller = new InternalUserController(repo);
        when(repo.findById(404L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> controller.getUserInternal(404L));

        assertTrue(ex.getMessage().contains("404"));
    }

    @ParameterizedTest(name = "exists endpoint case {0}")
    @MethodSource("existCases")
    void userExists_parameterizedCases(long id, boolean expected) {
        UserRepository repo = org.mockito.Mockito.mock(UserRepository.class);
        InternalUserController controller = new InternalUserController(repo);
        when(repo.existsById(id)).thenReturn(expected);

        Boolean result = controller.userExists(id);

        assertEquals(expected, result);
    }

    @ParameterizedTest(name = "internal mapping case {0}")
    @MethodSource("internalUserCases")
    void getUserInternal_parameterizedCases(int i) {
        UserRepository repo = org.mockito.Mockito.mock(UserRepository.class);
        InternalUserController controller = new InternalUserController(repo);

        UserRole role = UserRole.values()[i % UserRole.values().length];
        User user = new User((long) i, "User" + i, role, "u" + i + "@mail.com", "9" + i, "Active", "p");
        when(repo.findById((long) i)).thenReturn(Optional.of(user));

        InternalUserDTO dto = controller.getUserInternal((long) i);

        assertEquals("User" + i, dto.getName());
        assertEquals(role.name(), dto.getRole());
    }

    private static Stream<Arguments> existCases() {
        return Stream.of(
                Arguments.of(1L, true),
                Arguments.of(2L, false),
                Arguments.of(3L, true),
                Arguments.of(4L, false),
                Arguments.of(5L, true));
    }

    private static Stream<Arguments> internalUserCases() {
        return IntStream.rangeClosed(1, 5).mapToObj(Arguments::of);
    }
}
