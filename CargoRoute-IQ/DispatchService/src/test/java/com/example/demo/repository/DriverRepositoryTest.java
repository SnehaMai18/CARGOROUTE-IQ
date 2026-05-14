package com.example.demo.repository;


import com.example.demo.entities.Driver;
import com.example.demo.entities.enums.DriverStatus;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@TestPropertySource(properties = {
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "eureka.client.enabled=false"
})
class DriverRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DriverRepository driverRepository;

    private Driver driver1;
    private Driver driver2;
    private Driver driver3;

   
    // Setup
    @BeforeEach
    void setUp() {
        driver1 = buildDriver(
                "Sai",
                "LIC1001",
                DriverStatus.AVAILABLE
        );

        driver2 = buildDriver(
                "Bala",
                "LIC1002",
                DriverStatus.ON_ROUTE
        );

        driver3 = buildDriver(
                "Sri",
                "LIC1003",
                DriverStatus.AVAILABLE
        );

        entityManager.persist(driver1);
        entityManager.persist(driver2);
        entityManager.persist(driver3);
        entityManager.flush();
    }

    // Helper
    private Driver buildDriver(
            String name,
            String licenseNo,
            DriverStatus status
    ) {
        Driver driver = new Driver();
        driver.setName(name);
        driver.setLicenseNo(licenseNo);
        driver.setContactInfo(name.toLowerCase() + "@example.com");
        driver.setMobileNumber("9876543210");
        driver.setStatus(status);
        return driver;
    }

   
    // Save / FindById
    @Test
    @DisplayName("Save driver — persists and auto‑generates ID")
    void testSaveDriver() {
        Driver driver = buildDriver(
                "Dev",
                "LIC2001",
                DriverStatus.ASSIGNED
        );

        Driver saved = driverRepository.save(driver);

        assertThat(saved).isNotNull();
        assertThat(saved.getDriverID()).isNotNull().isPositive();
        assertThat(saved.getName()).isEqualTo("Dev");
        assertThat(saved.getStatus()).isEqualTo(DriverStatus.ASSIGNED);
    }

    @Test
    @DisplayName("Find driver by ID — found")
    void testFindById_Found() {
        Optional<Driver> found =
                driverRepository.findById(driver1.getDriverID());

        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Sai");
    }

    @Test
    @DisplayName("Find driver by ID — not found")
    void testFindById_NotFound() {
        Optional<Driver> found =
                driverRepository.findById(9999L);

        assertThat(found).isNotPresent();
    }

    
    // Find All
    @Test
    @DisplayName("Find all drivers — returns all persisted records")
    void testFindAll() {
        List<Driver> all = driverRepository.findAll();

        assertThat(all).hasSize(3);
    }

    
    // findByStatus
    @Test
    @DisplayName("findByStatus — returns matching drivers")
    void testFindByStatus_Available() {
        List<Driver> availableDrivers =
                driverRepository.findByStatus(
                        DriverStatus.AVAILABLE
                );

        assertThat(availableDrivers).hasSize(2);
        assertThat(availableDrivers)
                .allMatch(d ->
                        d.getStatus() == DriverStatus.AVAILABLE
                );
    }

    @Test
    @DisplayName("findByStatus — single match")
    void testFindByStatus_OnRoute() {
        List<Driver> onRouteDrivers =
                driverRepository.findByStatus(
                        DriverStatus.ON_ROUTE
                );

        assertThat(onRouteDrivers).hasSize(1);
        assertThat(onRouteDrivers.get(0).getName())
                .isEqualTo("Bala");
    }

    @Test
    @DisplayName("findByStatus — empty list when no match")
    void testFindByStatus_NoResults() {
        List<Driver> suspendedDrivers =
                driverRepository.findByStatus(
                        DriverStatus.SUSPENDED
                );

        assertThat(suspendedDrivers).isEmpty();
    }

    
    // Delete
    @Test
    @DisplayName("Delete driver by ID — driver no longer exists")
    void testDeleteById() {
        Long id = driver2.getDriverID();

        driverRepository.deleteById(id);
        entityManager.flush();

        assertThat(driverRepository.findById(id))
                .isNotPresent();
    }

   
    // Count / Exists
    @Test
    @DisplayName("Count — returns correct number of drivers")
    void testCount() {
        assertThat(driverRepository.count())
                .isEqualTo(3);
    }

    @Test
    @DisplayName("ExistsById — true for existing, false for unknown")
    void testExistsById() {
        assertThat(
                driverRepository.existsById(
                        driver1.getDriverID()
                )
        ).isTrue();

        assertThat(
                driverRepository.existsById(8888L)
        ).isFalse();
    }
}