package com.example.demo.repository;


import com.example.demo.entities.Handover;
import com.example.demo.entities.Manifest;

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
class HandoverRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private HandoverRepository handoverRepository;

    private Manifest manifest1;
    private Manifest manifest2;

    private Handover handover1;
    private Handover handover2;

    
    // Setup
    @BeforeEach
    void setUp() {

        manifest1 = buildManifest(1001L);
        manifest2 = buildManifest(1002L);

        entityManager.persist(manifest1);
        entityManager.persist(manifest2);

        handover1 = buildHandover(manifest1, "Sai");
        handover2 = buildHandover(manifest2, "Bala");

        entityManager.persist(handover1);
        entityManager.persist(handover2);

        entityManager.flush();
    }

   
    // Helpers
    private Manifest buildManifest(Long loadId) {
        Manifest manifest = new Manifest();
        manifest.setLoadID(loadId);
        manifest.setWarehouseID(501L);
        manifest.setItemsJSON("{\"item\":\"Electronics\"}");
        manifest.setCreatedBy("System");
        manifest.setCreatedAt(LocalDateTime.now());
        manifest.setManifestURI("http://manifest/" + loadId);
        return manifest;
    }

    private Handover buildHandover(Manifest manifest, String handedBy) {
        Handover handover = new Handover();
        handover.setManifest(manifest);
        handover.setHandedBy(handedBy);
        handover.setHandedAt(LocalDateTime.now());
        handover.setReceivedBy("Warehouse Staff");
        handover.setReceivedAt(LocalDateTime.now().plusHours(1));
        handover.setNotes("Handover completed successfully");
        return handover;
    }

    
    // Save / FindById
    @Test
    @DisplayName("Save handover — persists and auto-generates ID")
    void testSaveHandover() {
        Handover handover = buildHandover(manifest1, "Sri");

        Handover saved = handoverRepository.save(handover);

        assertThat(saved).isNotNull();
        assertThat(saved.getHandoverID()).isNotNull().isPositive();
        assertThat(saved.getHandedBy()).isEqualTo("Sri");
    }

    @Test
    @DisplayName("Find handover by ID — found")
    void testFindById_Found() {
        Optional<Handover> found = handoverRepository.findById(handover1.getHandoverID());

        assertThat(found).isPresent();
        assertThat(found.get().getHandedBy())
                .isEqualTo("Sai");
    }

    @Test
    @DisplayName("Find handover by ID — not found")
    void testFindById_NotFound() {
        Optional<Handover> found = handoverRepository.findById(9999L);

        assertThat(found).isNotPresent();
    }

    
    // Find All
    @Test
    @DisplayName("Find all handovers — returns all persisted records")
    void testFindAll() {
        List<Handover> all = handoverRepository.findAll();

        assertThat(all).hasSize(2);
    }

    
    // findByManifest_ManifestID
    @Test
    @DisplayName("findByManifest_ManifestID — returns matching handover")
    void testFindByManifestId() {
    	List<Handover> found = handoverRepository.findByManifest_ManifestID(manifest1.getManifestID());

    	assertThat(found).isNotNull();
    	assertThat(found).hasSize(1);
    	assertThat(found.get(0).getHandedBy())
    	        .isEqualTo("Sai");
    }

    @Test
    @DisplayName("findByManifest_ManifestID — returns null when not found")
    void testFindByManifestId_NotFound() {
    	List<Handover> found = handoverRepository.findByManifest_ManifestID(9999L);
    	assertThat(found).isEmpty();
    }

    
    // findByHandedBy
    @Test
    @DisplayName("findByHandedBy — returns matching handovers")
    void testFindByHandedBy() {
        List<Handover> results = handoverRepository.findByHandedBy("Bala");
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getHandedBy())
                .isEqualTo("Bala");
    }

    @Test
    @DisplayName("findByHandedBy — empty list when no match")
    void testFindByHandedBy_NoResults() {
        List<Handover> results = handoverRepository.findByHandedBy("Dev");
        assertThat(results).isEmpty();
    }

    // Delete
    @Test
    @DisplayName("Delete handover by ID — record no longer exists")
    void testDeleteById() {
        Long id = handover2.getHandoverID();

        handoverRepository.deleteById(id);
        entityManager.flush();

        assertThat(handoverRepository.findById(id))
                .isNotPresent();
    }

    // Count / Exists
    @Test
    @DisplayName("Count — returns correct number of handovers")
    void testCount() {
        assertThat(handoverRepository.count()).isEqualTo(2);
    }

    @Test
    @DisplayName("ExistsById — true for existing, false for unknown")
    void testExistsById() {
        assertThat(handoverRepository.existsById(handover1.getHandoverID())).isTrue();

        assertThat(handoverRepository.existsById(7777L)).isFalse();
    }
}