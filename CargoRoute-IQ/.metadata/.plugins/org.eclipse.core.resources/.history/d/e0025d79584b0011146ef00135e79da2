package com.example.demo.service;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
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

import com.example.demo.dto.BookingDTO;
import com.example.demo.dto.ProofOfDeliveryDTO;
import com.example.demo.dto.ProofOfDeliveryResponseDTO;
import com.example.demo.entities.ProofOfDelivery;
import com.example.demo.entities.enums.PodType;
import com.example.demo.entities.enums.ProofOfDeliveryStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ProofOfDeliveryRepository;
import com.example.demo.serviceimpl.ProofOfDeliveryServiceImpl;

@ExtendWith(MockitoExtension.class)
class ProofOfDeliveryServiceImplTest {

    @Mock
    private ProofOfDeliveryRepository repository;

    @Mock
    private RestTemplate restTemplate;

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
    void createWithImage_ShouldSaveAndReturnDTO() {

        when(repository.save(any(ProofOfDelivery.class)))
                .thenReturn(pod);

        ProofOfDeliveryDTO result =
                service.create(podDTO, validImageFile);

        assertNotNull(result);
        assertEquals(100L, result.getBookingID());
        assertEquals(ProofOfDeliveryStatus.UPLOADED, result.getStatus());
        verify(repository).save(any(ProofOfDelivery.class));
    }

    @Test
    void createWithImage_ShouldThrowBadRequest_WhenFileIsNull() {

        assertThrows(BadRequestException.class,
                () -> service.create(podDTO, null));
    }

    @Test
    void createWithImage_ShouldThrowBadRequest_WhenFileIsEmpty() {

        MultipartFile emptyFile = new MockMultipartFile(
                "file",
                "pod-image.png",
                "image/png",
                new byte[0]
        );

        assertThrows(BadRequestException.class,
                () -> service.create(podDTO, emptyFile));
    }

    @Test
    void createWithImage_ShouldThrowBadRequest_WhenFileTypeIsInvalid() {

        MultipartFile invalidFile = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                "Invalid POD file".getBytes()
        );

        assertThrows(BadRequestException.class,
                () -> service.create(podDTO, invalidFile));
    }

    // ────────────────── GET BY ID ──────────────────

    @Test
    void getById_ShouldReturnFullResponse_WhenBookingAvailable() {

        when(repository.findById(1L))
                .thenReturn(Optional.of(pod));

        when(restTemplate.getForObject(anyString(), eq(BookingDTO.class)))
                .thenReturn(bookingDTO);

        ProofOfDeliveryResponseDTO result = service.getById(1L);

        assertNotNull(result);
        assertNotNull(result.getBooking());
        assertEquals(1L,
                result.getProofOfDelivery().getPodID());
    }

    @Test
    void getByIdFallback_ShouldReturnPartialResponse() {

        when(repository.findById(1L))
                .thenReturn(Optional.of(pod));

        ProofOfDeliveryResponseDTO response =
                service.getByIdFallback(1L, new RuntimeException());

        assertNotNull(response);
        assertNull(response.getBooking());
        assertEquals("John Doe",
                response.getProofOfDelivery().getReceivedBy());
    }

    // ────────────────── GET BY POD TYPE ──────────────────

    @Test
    void getByPodType_ShouldReturnList_WhenFound() {

        when(repository.findByPodType(PodType.Signature))
                .thenReturn(Arrays.asList(pod));

        List<ProofOfDeliveryResponseDTO> results =
                service.getByPodType(PodType.Signature);

        assertEquals(1, results.size());
    }

    @Test
    void getByPodType_ShouldThrow_WhenNotFound() {

        when(repository.findByPodType(PodType.Photo))
                .thenReturn(Collections.emptyList());

        assertThrows(ResourceNotFoundException.class,
                () -> service.getByPodType(PodType.Photo));
    }

    // ────────────────── GET BY STATUS (FALLBACK) ──────────────────

    @Test
    void getByStatusFallback_ShouldReturnPartialResults() {

        when(repository.findByStatus(ProofOfDeliveryStatus.VERIFIED))
                .thenReturn(Arrays.asList(pod));

        List<ProofOfDeliveryResponseDTO> results =
                service.getByProofOfDeliveryStatusFallback(
                        ProofOfDeliveryStatus.VERIFIED,
                        new RuntimeException()
                );

        assertFalse(results.isEmpty());
        assertNull(results.get(0).getBooking());
    }

    // ────────────────── UPDATE ──────────────────

    @Test
    void update_ShouldModifyFields_WhenExists() {

        when(repository.findById(1L))
                .thenReturn(Optional.of(pod));

        when(repository.save(any(ProofOfDelivery.class)))
                .thenReturn(pod);

        podDTO.setReceivedBy("Jane Doe");

        ProofOfDeliveryDTO result = service.update(1L, podDTO);

        assertEquals("Jane Doe", result.getReceivedBy());
    }

    // ────────────────── DELETE ──────────────────

    @Test
    void delete_ShouldRemovePOD_WhenExists() {

        when(repository.findById(1L))
                .thenReturn(Optional.of(pod));

        doNothing().when(repository).delete(pod);

        service.delete(1L);

        verify(repository).delete(pod);
    }
}
