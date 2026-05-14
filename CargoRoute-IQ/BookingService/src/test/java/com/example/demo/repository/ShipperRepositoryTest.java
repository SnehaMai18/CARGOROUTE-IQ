package com.example.demo.repository;

import com.example.demo.entity.Shipper;
import com.example.demo.entity.enums.ShipperStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Repository slice tests for {@link ShipperRepository}.
 *
 * Uses @DataJpaTest which:
 *  - Spins up an H2 in-memory database (replaces MySQL datasource)
 *  - Scans @Entity classes and configures Spring Data JPA repositories
 *  - Wraps every test in a transaction that is rolled back after each test
 */
@DataJpaTest
@TestPropertySource(properties = {
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "eureka.client.enabled=false"
})
class ShipperRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ShipperRepository shipperRepository;

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    private Shipper buildShipper(String name, ShipperStatus status) {
        Shipper shipper = new Shipper();
        shipper.setName(name);
        shipper.setContactInfo(name.toLowerCase().replace(" ", ".") + "@example.com");
        shipper.setAccountTerms("Net 30");
        shipper.setStatus(status);
        return shipper;
    }

    // -------------------------------------------------------------------------
    // Save / Find by ID
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Save a shipper — persists and auto-generates ID")
    void testSaveShipper() {
        Shipper shipper = buildShipper("FastFreight Co", ShipperStatus.ACTIVE);

        Shipper saved = shipperRepository.save(shipper);

        assertThat(saved).isNotNull();
        assertThat(saved.getShipperID()).isNotNull().isPositive();
        assertThat(saved.getName()).isEqualTo("FastFreight Co");
        assertThat(saved.getStatus()).isEqualTo(ShipperStatus.ACTIVE);
        assertThat(saved.getAccountTerms()).isEqualTo("Net 30");
    }

    @Test
    @DisplayName("Find shipper by ID — returns the correct shipper")
    void testFindById_Found() {
        Shipper shipper = buildShipper("QuickShip Ltd", ShipperStatus.ACTIVE);
        entityManager.persist(shipper);
        entityManager.flush();

        Optional<Shipper> found = shipperRepository.findById(shipper.getShipperID());

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("QuickShip Ltd");
        assertThat(found.get().getContactInfo()).isEqualTo("quickship.ltd@example.com");
        assertThat(found.get().getStatus()).isEqualTo(ShipperStatus.ACTIVE);
    }

    @Test
    @DisplayName("Find shipper by non-existent ID — returns empty Optional")
    void testFindById_NotFound() {
        Optional<Shipper> found = shipperRepository.findById(999L);

        assertThat(found).isNotPresent();
    }

    // -------------------------------------------------------------------------
    // Find All
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Find all shippers — returns all persisted shippers")
    void testFindAll() {
        entityManager.persist(buildShipper("Shipper A", ShipperStatus.ACTIVE));
        entityManager.persist(buildShipper("Shipper B", ShipperStatus.INACTIVE));
        entityManager.persist(buildShipper("Shipper C", ShipperStatus.SUSPENDED));
        entityManager.flush();

        List<Shipper> all = shipperRepository.findAll();

        assertThat(all).hasSize(3);
    }

    @Test
    @DisplayName("Find all shippers — returns empty list when none persisted")
    void testFindAll_Empty() {
        List<Shipper> all = shipperRepository.findAll();

        assertThat(all).isEmpty();
    }

    // -------------------------------------------------------------------------
    // findByStatus
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("findByStatus ACTIVE — returns only active shippers")
    void testFindByStatus_Active() {
        entityManager.persist(buildShipper("Active One",   ShipperStatus.ACTIVE));
        entityManager.persist(buildShipper("Active Two",   ShipperStatus.ACTIVE));
        entityManager.persist(buildShipper("Inactive One", ShipperStatus.INACTIVE));
        entityManager.persist(buildShipper("Suspended One",ShipperStatus.SUSPENDED));
        entityManager.flush();

        List<Shipper> active = shipperRepository.findByStatus(ShipperStatus.ACTIVE);

        assertThat(active).hasSize(2);
        assertThat(active).allMatch(s -> s.getStatus() == ShipperStatus.ACTIVE);
    }

    @Test
    @DisplayName("findByStatus INACTIVE — returns only inactive shippers")
    void testFindByStatus_Inactive() {
        entityManager.persist(buildShipper("Active Shipper",   ShipperStatus.ACTIVE));
        entityManager.persist(buildShipper("Inactive Shipper", ShipperStatus.INACTIVE));
        entityManager.flush();

        List<Shipper> inactive = shipperRepository.findByStatus(ShipperStatus.INACTIVE);

        assertThat(inactive).hasSize(1);
        assertThat(inactive.get(0).getName()).isEqualTo("Inactive Shipper");
        assertThat(inactive.get(0).getStatus()).isEqualTo(ShipperStatus.INACTIVE);
    }

    @Test
    @DisplayName("findByStatus SUSPENDED — returns only suspended shippers")
    void testFindByStatus_Suspended() {
        entityManager.persist(buildShipper("Active Shipper",   ShipperStatus.ACTIVE));
        entityManager.persist(buildShipper("Suspended Shipper",ShipperStatus.SUSPENDED));
        entityManager.flush();

        List<Shipper> suspended = shipperRepository.findByStatus(ShipperStatus.SUSPENDED);

        assertThat(suspended).hasSize(1);
        assertThat(suspended.get(0).getName()).isEqualTo("Suspended Shipper");
    }

    @Test
    @DisplayName("findByStatus — returns empty list when no shipper matches the given status")
    void testFindByStatus_NoResults() {
        entityManager.persist(buildShipper("Active Shipper", ShipperStatus.ACTIVE));
        entityManager.flush();

        List<Shipper> suspended = shipperRepository.findByStatus(ShipperStatus.SUSPENDED);

        assertThat(suspended).isEmpty();
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Update shipper — persists changed name, contactInfo, and status")
    void testUpdateShipper() {
        Shipper shipper = buildShipper("Old Name Corp", ShipperStatus.ACTIVE);
        entityManager.persist(shipper);
        entityManager.flush();

        // Apply changes
        shipper.setName("New Name Corp");
        shipper.setContactInfo("updated@example.com");
        shipper.setStatus(ShipperStatus.SUSPENDED);
        shipperRepository.save(shipper);
        entityManager.flush();
        entityManager.clear(); // Detach to force reload from DB

        Optional<Shipper> updated = shipperRepository.findById(shipper.getShipperID());
        assertThat(updated).isPresent();
        assertThat(updated.get().getName()).isEqualTo("New Name Corp");
        assertThat(updated.get().getContactInfo()).isEqualTo("updated@example.com");
        assertThat(updated.get().getStatus()).isEqualTo(ShipperStatus.SUSPENDED);
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Delete shipper by ID — shipper no longer exists")
    void testDeleteById() {
        Shipper shipper = buildShipper("To Be Deleted", ShipperStatus.ACTIVE);
        entityManager.persist(shipper);
        entityManager.flush();

        Long id = shipper.getShipperID();
        shipperRepository.deleteById(id);
        entityManager.flush();

        assertThat(shipperRepository.findById(id)).isNotPresent();
    }

    @Test
    @DisplayName("Delete shipper entity — shipper no longer exists")
    void testDeleteEntity() {
        Shipper shipper = buildShipper("To Be Deleted Too", ShipperStatus.INACTIVE);
        entityManager.persist(shipper);
        entityManager.flush();

        Long id = shipper.getShipperID();
        shipperRepository.delete(shipper);
        entityManager.flush();

        assertThat(shipperRepository.findById(id)).isNotPresent();
    }

    // -------------------------------------------------------------------------
    // Count / ExistsById
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Count — returns the correct number of shippers")
    void testCount() {
        assertThat(shipperRepository.count()).isZero();

        entityManager.persist(buildShipper("Shipper X", ShipperStatus.ACTIVE));
        entityManager.persist(buildShipper("Shipper Y", ShipperStatus.INACTIVE));
        entityManager.flush();

        assertThat(shipperRepository.count()).isEqualTo(2);
    }

    @Test
    @DisplayName("ExistsById — true for existing ID, false for unknown ID")
    void testExistsById() {
        Shipper shipper = buildShipper("Existing Shipper", ShipperStatus.ACTIVE);
        entityManager.persist(shipper);
        entityManager.flush();

        assertThat(shipperRepository.existsById(shipper.getShipperID())).isTrue();
        assertThat(shipperRepository.existsById(9999L)).isFalse();
    }
}
