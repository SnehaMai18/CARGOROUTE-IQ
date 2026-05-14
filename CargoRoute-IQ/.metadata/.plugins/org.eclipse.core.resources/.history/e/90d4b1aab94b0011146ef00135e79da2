package com.example.demo.repository;


import com.example.demo.entities.ProofOfDelivery;
import com.example.demo.entities.enums.PodType;
import com.example.demo.entities.enums.ProofOfDeliveryStatus;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;


@DataJpaTest
@TestPropertySource(properties = {
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "eureka.client.enabled=false"
})
class ProofOfDeliveryRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProofOfDeliveryRepository proofOfDeliveryRepository;

    private ProofOfDelivery pod1;
    private ProofOfDelivery pod2;
    private ProofOfDelivery pod3;

    
    // Setup
    @BeforeEach
    void setUp() {
        pod1 = buildPod(
                1001L,
                PodType.Photo,
                ProofOfDeliveryStatus.PENDING
        );

        pod2 = buildPod(
                1002L,
                PodType.Signature,
                ProofOfDeliveryStatus.UPLOADED
        );

        pod3 = buildPod(
                1003L,
                PodType.Photo,
                ProofOfDeliveryStatus.VERIFIED
        );

        entityManager.persist(pod1);
        entityManager.persist(pod2);
        entityManager.persist(pod3);
        entityManager.flush();
    }

    
    // Helper
    private ProofOfDelivery buildPod(
            Long bookingId,
            PodType podType,
            ProofOfDeliveryStatus status
    ) {
        ProofOfDelivery pod = new ProofOfDelivery();
        pod.setBookingID(bookingId);
        pod.setDeliveredAt(LocalDateTime.now());
        pod.setReceivedBy("Customer");
        pod.setPodURI("http://pod/" + bookingId);
        pod.setPodType(podType);
        pod.setStatus(status);
        return pod;
    }

    
    // Save / FindById
    @Test
    @DisplayName("Save POD — persists and auto-generates ID")
    void testSaveProofOfDelivery() {
        ProofOfDelivery pod = buildPod(
                2001L,
                PodType.Signature,
                ProofOfDeliveryStatus.UPLOADED
        );

        ProofOfDelivery saved =
                proofOfDeliveryRepository.save(pod);

        assertThat(saved).isNotNull();
        assertThat(saved.getPodID()).isNotNull().isPositive();
        assertThat(saved.getBookingID()).isEqualTo(2001L);
    }

    @Test
    @DisplayName("Find POD by ID — found")
    void testFindById_Found() {
        Optional<ProofOfDelivery> found =
                proofOfDeliveryRepository.findById(
                        pod1.getPodID()
                );

        assertThat(found).isPresent();
        assertThat(found.get().getBookingID())
                .isEqualTo(1001L);
    }

    @Test
    @DisplayName("Find POD by ID — not found")
    void testFindById_NotFound() {
        Optional<ProofOfDelivery> found =
                proofOfDeliveryRepository.findById(9999L);

        assertThat(found).isNotPresent();
    }

    
    // Find All
    @Test
    @DisplayName("Find all PODs — returns all persisted records")
    void testFindAll() {
        List<ProofOfDelivery> all =
                proofOfDeliveryRepository.findAll();

        assertThat(all).hasSize(3);
    }

    
    // findByBookingID
    @Test
    @DisplayName("findByBookingID — returns matching POD")
    void testFindByBookingID() {
        ProofOfDelivery found =
                proofOfDeliveryRepository.findByBookingID(1002L);

        assertThat(found).isNotNull();
        assertThat(found.getStatus())
                .isEqualTo(ProofOfDeliveryStatus.UPLOADED);
    }

    @Test
    @DisplayName("findByBookingID — returns null when not found")
    void testFindByBookingID_NotFound() {
        ProofOfDelivery found =
                proofOfDeliveryRepository.findByBookingID(8888L);

        assertThat(found).isNull();
    }

    
    // findByPodType
    @Test
    @DisplayName("findByPodType — returns matching PODs")
    void testFindByPodType() {
        List<ProofOfDelivery> photoPods =
                proofOfDeliveryRepository.findByPodType(
                        PodType.Photo
                );

        assertThat(photoPods).hasSize(2);
        assertThat(photoPods)
                .allMatch(p -> p.getPodType() == PodType.Photo);
    }

    
    // findByStatus
    @Test
    @DisplayName("findByStatus — returns matching PODs")
    void testFindByStatus() {
        List<ProofOfDelivery> verifiedPods =
                proofOfDeliveryRepository.findByStatus(
                        ProofOfDeliveryStatus.VERIFIED
                );

        assertThat(verifiedPods).hasSize(1);
        assertThat(verifiedPods.get(0).getBookingID())
                .isEqualTo(1003L);
    }

    
    // Delete
    @Test
    @DisplayName("Delete POD by ID — record no longer exists")
    void testDeleteById() {
        Long id = pod2.getPodID();

        proofOfDeliveryRepository.deleteById(id);
        entityManager.flush();

        assertThat(
                proofOfDeliveryRepository.findById(id)
        ).isNotPresent();
    }

    
    // Count / Exists
    @Test
    @DisplayName("Count — returns correct number of POD records")
    void testCount() {
        assertThat(proofOfDeliveryRepository.count())
                .isEqualTo(3);
    }

    @Test
    @DisplayName("ExistsById — true for existing, false for unknown")
    void testExistsById() {
        assertThat(
                proofOfDeliveryRepository.existsById(
                        pod1.getPodID()
                )
        ).isTrue();

        assertThat(
                proofOfDeliveryRepository.existsById(7777L)
        ).isFalse();
    }
}
