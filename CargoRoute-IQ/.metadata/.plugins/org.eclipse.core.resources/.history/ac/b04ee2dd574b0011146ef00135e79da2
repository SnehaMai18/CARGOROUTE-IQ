package com.example.demo.repository;


import com.example.demo.entities.Driver;
import com.example.demo.entities.DriverAck;
import com.example.demo.entities.Dispatch;
import com.example.demo.entities.enums.DispatchStatus;
import com.example.demo.entities.enums.DriverStatus;

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
class DriverAckRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DriverAckRepository driverAckRepository;

    private Driver driver1;
    private Driver driver2;
    private Dispatch dispatch1;
    private Dispatch dispatch2;
    private DriverAck ack1;
    private DriverAck ack2;

    
    // Setup
    @BeforeEach
    void setUp() {

        // ✅ Names changed here
        driver1 = buildDriver("Sai", "LIC1001");
        driver2 = buildDriver("Bala", "LIC1002");

        dispatch1 = buildDispatch(1001L, "Admin", DispatchStatus.ASSIGNED);
        dispatch2 = buildDispatch(1002L, "Admin", DispatchStatus.IN_PROGRESS);

        entityManager.persist(driver1);
        entityManager.persist(driver2);
        entityManager.persist(dispatch1);
        entityManager.persist(dispatch2);

        ack1 = buildDriverAck(dispatch1, driver1);
        ack2 = buildDriverAck(dispatch2, driver2);

        entityManager.persist(ack1);
        entityManager.persist(ack2);

        entityManager.flush();
    }

    
    // Helpers
    private Driver buildDriver(String name, String licenseNo) {
        Driver driver = new Driver();
        driver.setName(name);
        driver.setLicenseNo(licenseNo);
        driver.setContactInfo(name.toLowerCase() + "@example.com");
        driver.setMobileNumber("9876543210");
        driver.setStatus(DriverStatus.AVAILABLE);
        return driver;
    }

    private Dispatch buildDispatch(
            Long loadId,
            String assignedBy,
            DispatchStatus status
    ) {
        Dispatch dispatch = new Dispatch();
        dispatch.setLoadID(loadId);
        dispatch.setAssignedDriverID(1L);
        dispatch.setAssignedBy(assignedBy);
        dispatch.setAssignedAt(LocalDateTime.now());
        dispatch.setStatus(status);
        return dispatch;
    }

    private DriverAck buildDriverAck(Dispatch dispatch, Driver driver) {
        DriverAck ack = new DriverAck();
        ack.setDispatch(dispatch);
        ack.setDriver(driver);
        ack.setAckAt(LocalDateTime.now());
        ack.setNotes("Driver acknowledged dispatch");
        return ack;
    }

    
    // Save / FindById
    @Test
    @DisplayName("Save driver acknowledgement — persists and auto-generates ID")
    void testSaveDriverAck() {
        DriverAck ack = buildDriverAck(dispatch1, driver1);

        DriverAck saved = driverAckRepository.save(ack);

        assertThat(saved).isNotNull();
        assertThat(saved.getAckID()).isNotNull().isPositive();
        assertThat(saved.getDriver().getName()).isEqualTo("Sai");
    }

    @Test
    @DisplayName("Find driver ack by ID — found")
    void testFindById_Found() {
        Optional<DriverAck> found =
                driverAckRepository.findById(ack1.getAckID());

        assertThat(found).isPresent();
        assertThat(found.get().getNotes())
                .isEqualTo("Driver acknowledged dispatch");
    }

    @Test
    @DisplayName("Find driver ack by ID — not found")
    void testFindById_NotFound() {
        Optional<DriverAck> found =
                driverAckRepository.findById(9999L);

        assertThat(found).isNotPresent();
    }

    
    // Find All
    @Test
    @DisplayName("Find all driver acknowledgements — returns all records")
    void testFindAll() {
        List<DriverAck> all = driverAckRepository.findAll();

        assertThat(all).hasSize(2);
    }

   
    // findByDispatch_DispatchID
    @Test
    @DisplayName("findByDispatch_DispatchID — returns matching acknowledgement")
    void testFindByDispatchID() {
    	List<DriverAck> found =
    	        driverAckRepository.findByDispatch_DispatchID(
    	                dispatch1.getDispatchID()
    	        );

    	assertThat(found).isNotNull();
    	assertThat(found).hasSize(1);
    	assertThat(found.get(0).getDriver().getDriverID())
    	        .isEqualTo(driver1.getDriverID());

    }

    
    // findByDriver_DriverID
    @Test
    @DisplayName("findByDriver_DriverID — returns matching acknowledgement")
    void testFindByDriverID() {
    	List<DriverAck> found =
    	        driverAckRepository.findByDriver_DriverID(
    	                driver2.getDriverID()
    	        );

    	assertThat(found).isNotNull();
    	assertThat(found).hasSize(1);
    	assertThat(found.get(0).getDispatch().getDispatchID())
    	        .isEqualTo(dispatch2.getDispatchID());
    }
}