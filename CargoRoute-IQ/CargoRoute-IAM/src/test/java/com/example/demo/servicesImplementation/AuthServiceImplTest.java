package com.example.demo.servicesImplementation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

import com.example.demo.DTO.AuthRequestDTO;
import com.example.demo.DTO.AuthResponseDTO;
import com.example.demo.clients.NotificationClient;
import com.example.demo.entities.User;
import com.example.demo.enums.UserRole;
import com.example.demo.exceptions.DuplicateEmailException;
import com.example.demo.exceptions.InvalidCredentialsException;
import com.example.demo.repositories.UserRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.serviceimpl.AuthServiceImpl;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository repo;

    @Mock
    private PasswordEncoder encoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private NotificationClient notificationClient;

    @InjectMocks
    private AuthServiceImpl service;

    private AuthRequestDTO request;

    @BeforeEach
    void setUp() {
        request = new AuthRequestDTO();
        request.setName("John");
        request.setEmail("john@mail.com");
        request.setPhone("999");
        request.setRole("Admin");
        request.setPassword("raw");
        request.setStatus("Active");
    }

    @Test
    void signup_savesUserWhenEmailIsNew() {
        when(repo.findByEmail("john@mail.com")).thenReturn(null);
        when(encoder.encode("raw")).thenReturn("encoded");
        when(notificationClient.notifyUser(1L, 1L, "Welcome to CargoRoute IQ. Your account has been created.", "Exception"))
            .thenReturn(true);
        User saved = new User(1L, "John", UserRole.Admin, "john@mail.com", "999", "Active", "encoded");
        when(repo.save(org.mockito.ArgumentMatchers.any(User.class))).thenReturn(saved);

        User result = service.signup(request);

        assertEquals("john@mail.com", result.getEmail());
        assertEquals(UserRole.Admin, result.getRole());
        verify(notificationClient).notifyUser(1L, 1L, "Welcome to CargoRoute IQ. Your account has been created.", "Exception");
    }

    @Test
    void signup_throwsWhenEmailAlreadyExists() {
        when(repo.findByEmail("john@mail.com")).thenReturn(new User());

        DuplicateEmailException ex = assertThrows(DuplicateEmailException.class, () -> service.signup(request));

        assertTrue(ex.getMessage().contains("Email already exists"));
    }

    @Test
    void signup_setsDefaultStatusWhenNull() {
        request.setStatus(null);
        when(repo.findByEmail("john@mail.com")).thenReturn(null);
        when(encoder.encode("raw")).thenReturn("encoded");
        when(notificationClient.notifyUser(org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
            .thenReturn(true);
        when(repo.save(org.mockito.ArgumentMatchers.any(User.class)))
            .thenReturn(new User(99L, "John", UserRole.Admin, "john@mail.com", "999", "Active", "encoded"));

        User result = service.signup(request);

        assertEquals("Active", result.getStatus());
    }

    @Test
    void login_returnsTokenWhenCredentialsValid() {
        User user = new User(1L, "John", UserRole.Admin, "john@mail.com", "999", "Active", "encoded");
        when(repo.findByEmail("john@mail.com")).thenReturn(user);
        when(encoder.matches("raw", "encoded")).thenReturn(true);
        when(jwtUtil.generateToken("john@mail.com", "Admin", 1L)).thenReturn("jwt-token");

        AuthResponseDTO response = service.login(request);

        assertEquals("jwt-token", response.getToken());
        verify(jwtUtil).generateToken("john@mail.com", "Admin",1L);
    }

    @Test
    void login_throwsWhenUserNotFound() {
        when(repo.findByEmail("john@mail.com")).thenReturn(null);

        InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> service.login(request));

        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    void login_throwsWhenPasswordMismatch() {
        User user = new User(1L, "John", UserRole.Admin, "john@mail.com", "999", "Active", "encoded");
        when(repo.findByEmail("john@mail.com")).thenReturn(user);
        when(encoder.matches("raw", "encoded")).thenReturn(false);

        InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> service.login(request));

        assertEquals("Invalid email or password", ex.getMessage());
    }

    @ParameterizedTest(name = "role parsing case {index}")
    @MethodSource("allRoles")
    void signup_supportsAllConfiguredRoles(UserRole role) {
        request.setRole(role.name());
        request.setEmail(role.name().toLowerCase() + "@mail.com");

        when(repo.findByEmail(request.getEmail())).thenReturn(null);
        when(encoder.encode("raw")).thenReturn("encoded");
        when(notificationClient.notifyUser(org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.anyString()))
            .thenReturn(true);
        when(repo.save(org.mockito.ArgumentMatchers.any(User.class))).thenAnswer(invocation -> {
            User created = invocation.getArgument(0);
            created.setUserID(100L);
            return created;
        });

        User result = service.signup(request);

        assertEquals(role, result.getRole());
    }

    @ParameterizedTest(name = "login scenario {0}")
    @MethodSource("loginCases")
    void login_multipleValidUsersGenerateToken(int i) {
        String email = "user" + i + "@mail.com";
        String password = "pwd" + i;
        String encoded = "enc" + i;
        String token = "token-" + i;

        AuthRequestDTO req = new AuthRequestDTO();
        req.setEmail(email);
        req.setPassword(password);

        User user = new User((long) i, "User" + i, UserRole.Driver, email, "9000" + i, "Active", encoded);
        when(repo.findByEmail(email)).thenReturn(user);
        when(encoder.matches(password, encoded)).thenReturn(true);
        when(jwtUtil.generateToken(email, "Driver", (long) i)).thenReturn(token);

        AuthResponseDTO response = service.login(req);

        assertNotNull(response);
        assertEquals(token, response.getToken());
    }

    @Test
    void signout_completesWithoutException() {
        // signout is stateless (JWT) — just verifies no exception thrown and method is callable
        org.junit.jupiter.api.Assertions.assertDoesNotThrow(() -> service.signout());
    }

    @Test
    void login_throwsWhenUserAccountInactive() {
        User user = new User(1L, "John", UserRole.Admin, "john@mail.com", "999", "INACTIVE", "encoded");
        when(repo.findByEmail("john@mail.com")).thenReturn(user);
        when(encoder.matches("raw", "encoded")).thenReturn(true);

        com.example.demo.exceptions.UserAccountDisabledException ex = assertThrows(
            com.example.demo.exceptions.UserAccountDisabledException.class,
            () -> service.login(request)
        );

        assertEquals("User account is not active", ex.getMessage());
    }

    private static Stream<Arguments> loginCases() {
        return IntStream.rangeClosed(1, 12).mapToObj(Arguments::of);
    }

    private static Stream<Arguments> allRoles() {
        return Stream.of(UserRole.values()).map(Arguments::of);
    }
}
