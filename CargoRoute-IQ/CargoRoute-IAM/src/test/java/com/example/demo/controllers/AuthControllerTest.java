package com.example.demo.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.stream.IntStream;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.demo.DTO.AuthRequestDTO;
import com.example.demo.DTO.AuthResponseDTO;
import com.example.demo.entities.User;
import com.example.demo.enums.UserRole;
import com.example.demo.services.AuthService;

@MockitoSettings(strictness = Strictness.LENIENT)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Test
    void signup_returnsCreated() {
        AuthService service = org.mockito.Mockito.mock(AuthService.class);
        AuthController controller = new AuthController(service);

        AuthRequestDTO req = request("john@mail.com", "Admin");
        User saved = new User(1L, "John", UserRole.Admin, "john@mail.com", "999", "Active", "enc");
        when(service.signup(req)).thenReturn(saved);

        ResponseEntity<String> response = controller.signup(req);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());

        assertEquals("Your account has been created successfully",response.getBody());

    }

    @Test
    void login_returnsOk() {
        AuthService service = org.mockito.Mockito.mock(AuthService.class);
        AuthController controller = new AuthController(service);

        AuthRequestDTO req = request("a@mail.com", "Driver");
        when(service.login(req)).thenReturn(new AuthResponseDTO("token"));

        ResponseEntity<AuthResponseDTO> response = controller.login(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("token", response.getBody().getToken());
    }

    @Test
    void login_delegatesToService() {
        AuthService service = org.mockito.Mockito.mock(AuthService.class);
        AuthController controller = new AuthController(service);

        AuthRequestDTO req = request("b@mail.com", "Analyst");
        when(service.login(req)).thenReturn(new AuthResponseDTO("jwt-123"));

        ResponseEntity<AuthResponseDTO> response = controller.login(req);

        assertNotNull(response.getBody());
        assertEquals("jwt-123", response.getBody().getToken());
        verify(service).login(req);
    }

    @Test
    void signout_returnsOk() {
        AuthService service = org.mockito.Mockito.mock(AuthService.class);
        AuthController controller = new AuthController(service);

        ResponseEntity<String> response = controller.signout();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Signed out successfully", response.getBody());
        verify(service).signout();
    }

    @ParameterizedTest(name = "signup endpoint case {0}")
    @MethodSource("signupCases")
    void signup_parameterizedCases(int i) {
        AuthService service = org.mockito.Mockito.mock(AuthService.class);
        AuthController controller = new AuthController(service);

        AuthRequestDTO req = request("user" + i + "@mail.com", "Driver");
        User saved = new User((long) i, "U" + i, UserRole.Driver, req.getEmail(), "9" + i, "Active", "enc");
        when(service.signup(req)).thenReturn(saved);

        ResponseEntity<String> response = controller.signup(req);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Your account has been created successfully",response.getBody());

    }

    @ParameterizedTest(name = "login endpoint case {0}")
    @MethodSource("loginCases")
    void login_parameterizedCases(int i) {
        AuthService service = org.mockito.Mockito.mock(AuthService.class);
        AuthController controller = new AuthController(service);

        AuthRequestDTO req = request("login" + i + "@mail.com", "Dispatcher");
        when(service.login(req)).thenReturn(new AuthResponseDTO("token-" + i));

        ResponseEntity<AuthResponseDTO> response = controller.login(req);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("token-" + i, response.getBody().getToken());
    }

    @ParameterizedTest(name = "signout endpoint case {0}")
    @MethodSource("signupCases")
    void signout_parameterizedCases(int i) {
        AuthService service = org.mockito.Mockito.mock(AuthService.class);
        AuthController controller = new AuthController(service);

        ResponseEntity<String> response = controller.signout();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Signed out successfully", response.getBody());
    }

    private AuthRequestDTO request(String email, String role) {
        AuthRequestDTO req = new AuthRequestDTO();
        req.setName("Name");
        req.setEmail(email);
        req.setPassword("pwd");
        req.setRole(role);
        req.setPhone("999");
        req.setStatus("Active");
        return req;
    }

    private static Stream<Arguments> signupCases() {
        return IntStream.rangeClosed(1, 5).mapToObj(Arguments::of);
    }

    private static Stream<Arguments> loginCases() {
        return IntStream.rangeClosed(1, 5).mapToObj(Arguments::of);
    }
}
