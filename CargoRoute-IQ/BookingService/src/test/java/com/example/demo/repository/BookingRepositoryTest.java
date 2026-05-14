package com.example.demo.repository;

import com.example.demo.entity.Booking;
import com.example.demo.entity.Shipper;
import com.example.demo.entity.enums.BookingStatus;
import com.example.demo.entity.enums.ShipperStatus;
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

/**
 * Repository slice tests for {@link BookingRepository}.
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
class BookingRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BookingRepository bookingRepository;

    private Shipper shipper1;
    private Shipper shipper2;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    @BeforeEach
    void setUp() {
        shipper1 = new Shipper();
        shipper1.setName("Shipper One");
        shipper1.setContactInfo("one@example.com");
        shipper1.setAccountTerms("Net 30");
        shipper1.setStatus(ShipperStatus.ACTIVE);
        entityManager.persist(shipper1);

        shipper2 = new Shipper();
        shipper2.setName("Shipper Two");
        shipper2.setContactInfo("two@example.com");
        shipper2.setAccountTerms("Net 60");
        shipper2.setStatus(ShipperStatus.ACTIVE);
        entityManager.persist(shipper2);

        entityManager.flush();
    }

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    private Booking buildBooking(Shipper shipper, BookingStatus status) {
        Booking booking = new Booking();
        booking.setShipper(shipper);
        booking.setOriginSiteID(100L);
        booking.setDestinationSiteID(200L);
        booking.setPickupWindowStart(LocalDateTime.now().plusDays(1));
        booking.setPickupWindowEnd(LocalDateTime.now().plusDays(1).plusHours(4));
        booking.setDeliveryWindowStart(LocalDateTime.now().plusDays(3));
        booking.setDeliveryWindowEnd(LocalDateTime.now().plusDays(3).plusHours(4));
        booking.setWeightKg(150.0);
        booking.setVolumeM3(3.0);
        booking.setPieces(20);
        booking.setCommodity("Electronics");
        booking.setSpecialHandlingFlags("FRAGILE");
        booking.setStatus(status);
        return booking;
    }

    // -------------------------------------------------------------------------
    // Save / Find by ID
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Save a booking — persists and auto-generates ID")
    void testSaveBooking() {
        Booking booking = buildBooking(shipper1, BookingStatus.SUBMITTED);

        Booking saved = bookingRepository.save(booking);

        assertThat(saved).isNotNull();
        assertThat(saved.getBookingID()).isNotNull().isPositive();
        assertThat(saved.getStatus()).isEqualTo(BookingStatus.SUBMITTED);
        assertThat(saved.getCommodity()).isEqualTo("Electronics");
        assertThat(saved.getShipper().getShipperID()).isEqualTo(shipper1.getShipperID());
    }

    @Test
    @DisplayName("Find booking by ID — returns the correct booking")
    void testFindById_Found() {
        Booking booking = buildBooking(shipper1, BookingStatus.PLANNED);
        entityManager.persist(booking);
        entityManager.flush();

        Optional<Booking> found = bookingRepository.findById(booking.getBookingID());

        assertThat(found).isPresent();
        assertThat(found.get().getBookingID()).isEqualTo(booking.getBookingID());
        assertThat(found.get().getCommodity()).isEqualTo("Electronics");
        assertThat(found.get().getWeightKg()).isEqualTo(150.0);
    }

    @Test
    @DisplayName("Find booking by non-existent ID — returns empty Optional")
    void testFindById_NotFound() {
        Optional<Booking> found = bookingRepository.findById(999L);

        assertThat(found).isNotPresent();
    }

    // -------------------------------------------------------------------------
    // Find All
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Find all bookings — returns all persisted bookings")
    void testFindAll() {
        entityManager.persist(buildBooking(shipper1, BookingStatus.SUBMITTED));
        entityManager.persist(buildBooking(shipper2, BookingStatus.PLANNED));
        entityManager.persist(buildBooking(shipper1, BookingStatus.IN_TRANSIT));
        entityManager.flush();

        List<Booking> all = bookingRepository.findAll();

        assertThat(all).hasSize(3);
    }

    // -------------------------------------------------------------------------
    // findByStatus
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("findByStatus — returns only bookings with matching status")
    void testFindByStatus_MultipleResults() {
        entityManager.persist(buildBooking(shipper1, BookingStatus.SUBMITTED));
        entityManager.persist(buildBooking(shipper2, BookingStatus.SUBMITTED));
        entityManager.persist(buildBooking(shipper1, BookingStatus.PLANNED));
        entityManager.flush();

        List<Booking> submitted = bookingRepository.findByStatus(BookingStatus.SUBMITTED);
        List<Booking> planned   = bookingRepository.findByStatus(BookingStatus.PLANNED);

        assertThat(submitted).hasSize(2);
        assertThat(submitted).allMatch(b -> b.getStatus() == BookingStatus.SUBMITTED);
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).getStatus()).isEqualTo(BookingStatus.PLANNED);
    }

    @Test
    @DisplayName("findByStatus — returns empty list when no match")
    void testFindByStatus_NoResults() {
        entityManager.persist(buildBooking(shipper1, BookingStatus.SUBMITTED));
        entityManager.flush();

        List<Booking> dispatched = bookingRepository.findByStatus(BookingStatus.DISPATCHED);

        assertThat(dispatched).isEmpty();
    }

    @Test
    @DisplayName("findByStatus — correctly returns each distinct status")
    void testFindByStatus_AllStatuses() {
        entityManager.persist(buildBooking(shipper1, BookingStatus.DISPATCHED));
        entityManager.persist(buildBooking(shipper2, BookingStatus.IN_TRANSIT));
        entityManager.persist(buildBooking(shipper1, BookingStatus.DELIVERED));
        entityManager.persist(buildBooking(shipper2, BookingStatus.CANCELLED));
        entityManager.flush();

        assertThat(bookingRepository.findByStatus(BookingStatus.DISPATCHED)).hasSize(1);
        assertThat(bookingRepository.findByStatus(BookingStatus.IN_TRANSIT)).hasSize(1);
        assertThat(bookingRepository.findByStatus(BookingStatus.DELIVERED)).hasSize(1);
        assertThat(bookingRepository.findByStatus(BookingStatus.CANCELLED)).hasSize(1);
    }

    // -------------------------------------------------------------------------
    // findByShipper_ShipperID
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("findByShipper_ShipperID — returns bookings belonging to the given shipper")
    void testFindByShipperID() {
        entityManager.persist(buildBooking(shipper1, BookingStatus.SUBMITTED));
        entityManager.persist(buildBooking(shipper1, BookingStatus.PLANNED));
        entityManager.persist(buildBooking(shipper2, BookingStatus.IN_TRANSIT));
        entityManager.flush();

        List<Booking> shipper1Bookings = bookingRepository.findByShipper_ShipperID(shipper1.getShipperID());
        List<Booking> shipper2Bookings = bookingRepository.findByShipper_ShipperID(shipper2.getShipperID());

        assertThat(shipper1Bookings).hasSize(2);
        assertThat(shipper1Bookings).allMatch(b -> b.getShipper().getShipperID().equals(shipper1.getShipperID()));
        assertThat(shipper2Bookings).hasSize(1);
        assertThat(shipper2Bookings.get(0).getStatus()).isEqualTo(BookingStatus.IN_TRANSIT);
    }

    @Test
    @DisplayName("findByShipper_ShipperID — returns empty list for unknown shipper ID")
    void testFindByShipperID_NotFound() {
        entityManager.persist(buildBooking(shipper1, BookingStatus.SUBMITTED));
        entityManager.flush();

        List<Booking> result = bookingRepository.findByShipper_ShipperID(9999L);

        assertThat(result).isEmpty();
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Update booking — persists changed fields correctly")
    void testUpdateBooking() {
        Booking booking = buildBooking(shipper1, BookingStatus.SUBMITTED);
        entityManager.persist(booking);
        entityManager.flush();

        // Apply changes
        booking.setStatus(BookingStatus.PLANNED);
        booking.setCommodity("Furniture");
        booking.setWeightKg(500.0);
        bookingRepository.save(booking);
        entityManager.flush();
        entityManager.clear(); // Detach to force reload from DB

        Optional<Booking> updated = bookingRepository.findById(booking.getBookingID());
        assertThat(updated).isPresent();
        assertThat(updated.get().getStatus()).isEqualTo(BookingStatus.PLANNED);
        assertThat(updated.get().getCommodity()).isEqualTo("Furniture");
        assertThat(updated.get().getWeightKg()).isEqualTo(500.0);
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Delete booking by ID — booking no longer exists")
    void testDeleteById() {
        Booking booking = buildBooking(shipper1, BookingStatus.SUBMITTED);
        entityManager.persist(booking);
        entityManager.flush();

        Long id = booking.getBookingID();
        bookingRepository.deleteById(id);
        entityManager.flush();

        assertThat(bookingRepository.findById(id)).isNotPresent();
    }

    @Test
    @DisplayName("Delete booking entity — booking no longer exists")
    void testDeleteEntity() {
        Booking booking = buildBooking(shipper2, BookingStatus.CANCELLED);
        entityManager.persist(booking);
        entityManager.flush();

        Long id = booking.getBookingID();
        bookingRepository.delete(booking);
        entityManager.flush();

        assertThat(bookingRepository.findById(id)).isNotPresent();
    }

    // -------------------------------------------------------------------------
    // Count / ExistsById
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Count — returns the correct number of bookings")
    void testCount() {
        entityManager.persist(buildBooking(shipper1, BookingStatus.SUBMITTED));
        entityManager.persist(buildBooking(shipper2, BookingStatus.PLANNED));
        entityManager.flush();

        assertThat(bookingRepository.count()).isEqualTo(2);
    }

    @Test
    @DisplayName("ExistsById — true for existing ID, false for unknown ID")
    void testExistsById() {
        Booking booking = buildBooking(shipper1, BookingStatus.SUBMITTED);
        entityManager.persist(booking);
        entityManager.flush();

        assertThat(bookingRepository.existsById(booking.getBookingID())).isTrue();
        assertThat(bookingRepository.existsById(9999L)).isFalse();
    }
}
