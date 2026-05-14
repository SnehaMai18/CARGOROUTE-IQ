package com.example.demo.repository;


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
class ManifestRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ManifestRepository manifestRepository;

    private Manifest manifest1;
    private Manifest manifest2;
    private Manifest manifest3;

    
    // Setup
    @BeforeEach
    void setUp() {
        manifest1 = buildManifest(1001L, 501L);
        manifest2 = buildManifest(1002L, 501L);
        manifest3 = buildManifest(1003L, 502L);

        entityManager.persist(manifest1);
        entityManager.persist(manifest2);
        entityManager.persist(manifest3);
        entityManager.flush();
    }

    // Helper
    private Manifest buildManifest(Long loadId, Long warehouseId) {
        Manifest manifest = new Manifest();
        manifest.setLoadID(loadId);
        manifest.setWarehouseID(warehouseId);
        manifest.setItemsJSON("{\"item\":\"Electronics\"}");
        manifest.setCreatedBy("system");
        manifest.setCreatedAt(LocalDateTime.now());
        manifest.setManifestURI("http://manifest/" + loadId);
        return manifest;
    }

    // Save / FindById
    @Test
    @DisplayName("Save manifest — persists and auto-generates ID")
    void testSaveManifest() {
        Manifest manifest = buildManifest(2001L, 601L);

        Manifest saved = manifestRepository.save(manifest);

        assertThat(saved).isNotNull();
        assertThat(saved.getManifestID()).isNotNull().isPositive();
        assertThat(saved.getLoadID()).isEqualTo(2001L);
        assertThat(saved.getWarehouseID()).isEqualTo(601L);
    }

    @Test
    @DisplayName("Find manifest by ID — found")
    void testFindById_Found() {
        Optional<Manifest> found =
                manifestRepository.findById(manifest1.getManifestID());

        assertThat(found).isPresent();
        assertThat(found.get().getLoadID()).isEqualTo(1001L);
    }

    @Test
    @DisplayName("Find manifest by ID — not found")
    void testFindById_NotFound() {
        Optional<Manifest> found =
                manifestRepository.findById(9999L);

        assertThat(found).isNotPresent();
    }

    // Find All
    @Test
    @DisplayName("Find all manifests — returns all persisted records")
    void testFindAll() {
        List<Manifest> all = manifestRepository.findAll();

        assertThat(all).hasSize(3);
    }

    
    // findByLoadID
    @Test
    @DisplayName("findByLoadID — returns matching manifest")
    void testFindByLoadID_Found() {
        Manifest found = manifestRepository.findByLoadID(1001L);

        assertThat(found).isNotNull();
        assertThat(found.getManifestID())
                .isEqualTo(manifest1.getManifestID());
    }

    @Test
    @DisplayName("findByLoadID — returns null when not found")
    void testFindByLoadID_NotFound() {
        Manifest found = manifestRepository.findByLoadID(9999L);

        assertThat(found).isNull();
    }

   
    // findByWarehouseID
    @Test
    @DisplayName("findByWarehouseID — returns matching manifests")
    void testFindByWarehouseID() {
        List<Manifest> results =
                manifestRepository.findByWarehouseID(501L);

        assertThat(results).hasSize(2);
        assertThat(results)
                .allMatch(m -> m.getWarehouseID().equals(501L));
    }

    @Test
    @DisplayName("findByWarehouseID — empty list when no match")
    void testFindByWarehouseID_NoResults() {
        List<Manifest> results =
                manifestRepository.findByWarehouseID(999L);

        assertThat(results).isEmpty();
    }

   
    // Delete
    @Test
    @DisplayName("Delete manifest by ID — manifest no longer exists")
    void testDeleteById() {
        Long id = manifest2.getManifestID();

        manifestRepository.deleteById(id);
        entityManager.flush();

        assertThat(manifestRepository.findById(id))
                .isNotPresent();
    }

   
    // Count / Exists
    @Test
    @DisplayName("Count — returns correct number of manifests")
    void testCount() {
        assertThat(manifestRepository.count()).isEqualTo(3);
    }

    @Test
    @DisplayName("ExistsById — true for existing, false for unknown")
    void testExistsById() {
        assertThat(
                manifestRepository.existsById(
                        manifest1.getManifestID()
                )
        ).isTrue();

        assertThat(
                manifestRepository.existsById(8888L)
        ).isFalse();
    }
}