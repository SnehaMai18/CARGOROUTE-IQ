package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.clients.NotificationClient;
import com.example.demo.clients.RoleResolverClient;
import com.example.demo.clients.TaskClient;
import com.example.demo.dto.BookingDTO;
import com.example.demo.dto.ProofOfDeliveryDTO;
import com.example.demo.dto.ProofOfDeliveryResponseDTO;
import com.example.demo.entities.ProofOfDelivery;
import com.example.demo.entities.enums.PodType;
import com.example.demo.entities.enums.ProofOfDeliveryStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.repository.ProofOfDeliveryRepository;
import com.example.demo.serviceimpl.ProofOfDeliveryServiceImpl;

@ExtendWith(MockitoExtension.class)
class ProofOfDeliveryServiceImplTest {

    @Mock
    private ProofOfDeliveryRepository repository;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private NotificationClient notificationClient;

    @Mock
    private TaskClient taskClient;

    @Mock
    private RoleResolverClient roleResolverClient;

    @InjectMocks
    private ProofOfDeliveryServiceImpl service;

    private ProofOfDelivery pod;
    private ProofOfDeliveryDTO podDTO;
    private BookingDTO bookingDTO;
    private MultipartFile validImageFile;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(
                service,
                "podUploadDir",
                "target/test-pods"
        );

        pod = new ProofOfDelivery();
        pod.setPodID(1L);
        pod.setBookingID(100L);
        pod.setReceivedBy("John Doe");
        pod.setPodType(PodType.Signature);
        pod.setStatus(ProofOfDeliveryStatus.UPLOADED);
        pod.setDeliveredAt(LocalDateTime.now());
        pod.setPodURI("/pods/pod-image.png");

        podDTO = new ProofOfDeliveryDTO();
        podDTO.setBookingID(100L);
        podDTO.setPodType(PodType.Signature);

        bookingDTO = new BookingDTO();

        validImageFile = new MockMultipartFile(
                "file",
                "pod-image.png",
                "image/png",
                "Sample POD image content".getBytes()
        );
    }

    // ────────────────── CREATE WITH IMAGE ──────────────────

    @Test
    void create_ShouldSaveAndNotifyUsers() {
        // Arrange: Mock the role resolver to return user IDs
        when(roleResolverClient.getUserByRole("Dispatcher")).thenReturn(201L);
        when(roleResolverClient.getUserByRole("Admin")).thenReturn(999L);
        when(roleResolverClient.getUserByRole("Shipper")).thenReturn(301L);
        
        // Return pod when saved (service saves twice, so handle both)
        when(repository.save(any(ProofOfDelivery.class))).thenReturn(pod);

        // Act
        ProofOfDeliveryDTO result = service.create(podDTO, validImageFile);

        // Assert
        assertNotNull(result);
        assertEquals(ProofOfDeliveryStatus.UPLOADED, result.getStatus());
        
        // Verify notifications were sent to Dispatcher, Admin, and Shipper
        verify(notificationClient, times(3)).notifyUser(anyLong(), anyLong(), anyString(), anyString());
        verify(repository, atLeastOnce()).save(any(ProofOfDelivery.class));
    }

    @Test
    void createWithImage_ShouldThrowBadRequest_WhenFileIsNull() {
        assertThrows(BadRequestException.class, () -> service.create(podDTO, null));
    }

    // ────────────────── UPDATE ──────────────────

    @Test
    void update_ShouldHandleRejectedStatusAndCreateTask() {
        // Arrange
        when(repository.findById(1L)).thenReturn(Optional.of(pod));
        when(repository.save(any(ProofOfDelivery.class))).thenReturn(pod);
        when(roleResolverClient.getUserByRole("Dispatcher")).thenReturn(201L);
        when(roleResolverClient.getUserByRole("Admin")).thenReturn(999L);

        ProofOfDeliveryDTO updateDto = new ProofOfDeliveryDTO();
        updateDto.setStatus(ProofOfDeliveryStatus.REJECTED);

        // Act
        ProofOfDeliveryDTO result = service.update(1L, updateDto);

        // Assert
        assertNotNull(result);
        // Verify notification sent for delivery issue
        verify(notificationClient).notifyUser(eq(201L), eq(1L), contains("issue reported"), eq("Delivery"));
        // Verify task created for Dispatcher to investigate
        verify(taskClient).createTask(eq(201L), eq(1L), contains("Investigate"), isNull());
    }

    // ────────────────── FETCH BY ID ──────────────────

    @Test
    void getById_ShouldReturnFullResponse_WhenBookingAvailable() {
        when(repository.findById(1L)).thenReturn(Optional.of(pod));
        when(restTemplate.getForObject(anyString(), eq(BookingDTO.class))).thenReturn(bookingDTO);

        ProofOfDeliveryResponseDTO result = service.getById(1L);

        assertNotNull(result);
        assertNotNull(result.getBooking());
        verify(restTemplate).getForObject(contains("getBookingById"), eq(BookingDTO.class));
    }

    // ────────────────── DELETE ──────────────────

    @Test
    void delete_ShouldRemovePOD_WhenExists() {
        when(repository.findById(1L)).thenReturn(Optional.of(pod));
        
        service.delete(1L);

        verify(repository).delete(pod);
    }
}