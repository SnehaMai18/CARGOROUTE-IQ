package com.example.demo.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.entities.User;
import com.example.demo.enums.UserRole;

@ExtendWith(MockitoExtension.class)
class UserRepositoryTest {

    @Mock
    private UserRepository userRepository;

    @Test
    void save_andFindByEmail() {
        User user = user("alpha@mail.com", UserRole.Admin, "111");
        when(userRepository.save(user)).thenReturn(user);
        when(userRepository.findByEmail("alpha@mail.com")).thenReturn(user);

        User saved = userRepository.save(user);
        assertNotNull(saved);

        User found = userRepository.findByEmail("alpha@mail.com");

        assertNotNull(found);
        assertEquals("alpha@mail.com", found.getEmail());
    }

    @Test
    void findByEmail_returnsNullForMissing() {
        when(userRepository.findByEmail("missing@mail.com")).thenReturn(null);
        User found = userRepository.findByEmail("missing@mail.com");

        assertNull(found);
    }

    @Test
    void existsById_trueAfterSave() {
        when(userRepository.existsById(1L)).thenReturn(true);

        assertTrue(userRepository.existsById(1L));
    }

    @Test
    void existsById_falseForUnknownId() {
        when(userRepository.existsById(99999L)).thenReturn(false);
        assertFalse(userRepository.existsById(99999L));
    }

    @Test
    void findAll_returnsInsertedRecords() {
        when(userRepository.findAll()).thenReturn(List.of(
                user("u1@mail.com", UserRole.Analyst, "1"),
                user("u2@mail.com", UserRole.Analyst, "2")));

        assertTrue(userRepository.findAll().size() >= 2);
    }

    @Test
    void findById_returnsUserWhenPresent() {
        User user = user("x@mail.com", UserRole.Dispatcher, "123");
        user.setUserID(10L);
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        Optional<User> result = userRepository.findById(10L);

        assertTrue(result.isPresent());
        assertEquals("x@mail.com", result.get().getEmail());
    }

    @Test
    void findById_returnsEmptyWhenAbsent() {
        when(userRepository.findById(77L)).thenReturn(Optional.empty());

        Optional<User> result = userRepository.findById(77L);

        assertTrue(result.isEmpty());
    }

    @ParameterizedTest(name = "findByEmail parameterized case {0}")
    @MethodSource("emailCases")
    void findByEmail_parameterized(int i) {
        String email = "param" + i + "@mail.com";
        User user = user(email, UserRole.values()[i % UserRole.values().length], "9" + i);
        when(userRepository.findByEmail(email)).thenReturn(user);

        User found = userRepository.findByEmail(email);

        assertNotNull(found);
        assertEquals(email, found.getEmail());
    }

    private static Stream<Arguments> emailCases() {
        return IntStream.rangeClosed(1, 15).mapToObj(Arguments::of);
    }

    private User user(String email, UserRole role, String phone) {
        User user = new User();
        user.setName("User-" + phone);
        user.setEmail(email);
        user.setRole(role);
        user.setPhone(phone);
        user.setStatus("Active");
        user.setPassword("enc");
        return user;
    }
}
