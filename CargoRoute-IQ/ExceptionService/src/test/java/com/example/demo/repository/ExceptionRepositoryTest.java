package com.example.demo.repository;

import com.example.demo.entity.ExceptionRecord;
import com.example.demo.entity.enums.ExceptionStatus;
import com.example.demo.entity.enums.ExceptionType;
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
 * Repository slice tests for {@link ExceptionRepository}.
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
class ExceptionRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ExceptionRepository exceptionRepository;

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    private ExceptionRecord buildException(ExceptionType type, ExceptionStatus status, Long bookingId, Long reportedBy) {
        ExceptionRecord record = new ExceptionRecord();
        record.setType(type);
        record.setStatus(status);
        record.setBookingId(bookingId);
        record.setReportedBy(reportedBy);
        record.setDescription("Test exception: " + type.name());
        return record;
    }

    // -------------------------------------------------------------------------
    // Save / Find by ID
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Save an exception record — persists and auto-generates ID")
    void testSaveException() {
        ExceptionRecord record = buildException(ExceptionType.DELAY, ExceptionStatus.PENDING, 101L, 1L);

        ExceptionRecord saved = exceptionRepository.save(record);

        assertThat(saved).isNotNull();
        assertThat(saved.getExceptionID()).isNotNull().isPositive();
        assertThat(saved.getType()).isEqualTo(ExceptionType.DELAY);
        assertThat(saved.getStatus()).isEqualTo(ExceptionStatus.PENDING);
        assertThat(saved.getBookingId()).isEqualTo(101L);
        assertThat(saved.getReportedBy()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Find exception by ID — returns the correct record")
    void testFindById_Found() {
        ExceptionRecord record = buildException(ExceptionType.DAMAGE, ExceptionStatus.IN_REVIEW, 202L, 2L);
        entityManager.persist(record);
        entityManager.flush();

        Optional<ExceptionRecord> found = exceptionRepository.findById(record.getExceptionID());

        assertThat(found).isPresent();
        assertThat(found.get().getExceptionID()).isEqualTo(record.getExceptionID());
        assertThat(found.get().getType()).isEqualTo(ExceptionType.DAMAGE);
        assertThat(found.get().getDescription()).isEqualTo("Test exception: DAMAGE");
    }

    @Test
    @DisplayName("Find exception by non-existent ID — returns empty Optional")
    void testFindById_NotFound() {
        Optional<ExceptionRecord> found = exceptionRepository.findById(9999L);

        assertThat(found).isNotPresent();
    }

    // -------------------------------------------------------------------------
    // Find All
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Find all exception records — returns all persisted records")
    void testFindAll() {
        entityManager.persist(buildException(ExceptionType.DELAY,   ExceptionStatus.PENDING,   1L, 1L));
        entityManager.persist(buildException(ExceptionType.DAMAGE,  ExceptionStatus.IN_REVIEW, 2L, 2L));
        entityManager.persist(buildException(ExceptionType.MISSING, ExceptionStatus.RESOLVED,  3L, 3L));
        entityManager.flush();

        List<ExceptionRecord> all = exceptionRepository.findAll();

        assertThat(all).hasSize(3);
    }

    @Test
    @DisplayName("Find all exception records — returns empty list when none exist")
    void testFindAll_Empty() {
        assertThat(exceptionRepository.findAll()).isEmpty();
    }

    // -------------------------------------------------------------------------
    // findByBookingId
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("findByBookingId — returns only records for the given booking ID")
    void testFindByBookingId_MultipleResults() {
        entityManager.persist(buildException(ExceptionType.DELAY,  ExceptionStatus.PENDING,   100L, 1L));
        entityManager.persist(buildException(ExceptionType.DAMAGE, ExceptionStatus.IN_REVIEW, 100L, 2L));
        entityManager.persist(buildException(ExceptionType.MISSING,ExceptionStatus.RESOLVED,  200L, 3L));
        entityManager.flush();

        List<ExceptionRecord> booking100 = exceptionRepository.findByBookingId(100L);
        List<ExceptionRecord> booking200 = exceptionRepository.findByBookingId(200L);

        assertThat(booking100).hasSize(2);
        assertThat(booking100).allMatch(e -> e.getBookingId().equals(100L));
        assertThat(booking200).hasSize(1);
        assertThat(booking200.get(0).getType()).isEqualTo(ExceptionType.MISSING);
    }

    @Test
    @DisplayName("findByBookingId — returns empty list for unknown booking ID")
    void testFindByBookingId_NotFound() {
        entityManager.persist(buildException(ExceptionType.DELAY, ExceptionStatus.PENDING, 100L, 1L));
        entityManager.flush();

        assertThat(exceptionRepository.findByBookingId(9999L)).isEmpty();
    }

    // -------------------------------------------------------------------------
    // findByStatus
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("findByStatus — returns only records with the given status")
    void testFindByStatus_MultipleResults() {
        entityManager.persist(buildException(ExceptionType.DELAY,   ExceptionStatus.PENDING,   1L, 1L));
        entityManager.persist(buildException(ExceptionType.DAMAGE,  ExceptionStatus.PENDING,   2L, 2L));
        entityManager.persist(buildException(ExceptionType.MISSING, ExceptionStatus.IN_REVIEW, 3L, 3L));
        entityManager.flush();

        List<ExceptionRecord> pending   = exceptionRepository.findByStatus(ExceptionStatus.PENDING);
        List<ExceptionRecord> inReview  = exceptionRepository.findByStatus(ExceptionStatus.IN_REVIEW);

        assertThat(pending).hasSize(2);
        assertThat(pending).allMatch(e -> e.getStatus() == ExceptionStatus.PENDING);
        assertThat(inReview).hasSize(1);
        assertThat(inReview.get(0).getType()).isEqualTo(ExceptionType.MISSING);
    }

    @Test
    @DisplayName("findByStatus — returns empty list when no records match")
    void testFindByStatus_NoResults() {
        entityManager.persist(buildException(ExceptionType.DELAY, ExceptionStatus.PENDING, 1L, 1L));
        entityManager.flush();

        assertThat(exceptionRepository.findByStatus(ExceptionStatus.RESOLVED)).isEmpty();
    }

    @Test
    @DisplayName("findByStatus — correctly returns each distinct status")
    void testFindByStatus_AllStatuses() {
        entityManager.persist(buildException(ExceptionType.DELAY,   ExceptionStatus.PENDING,   1L, 1L));
        entityManager.persist(buildException(ExceptionType.DAMAGE,  ExceptionStatus.IN_REVIEW, 2L, 2L));
        entityManager.persist(buildException(ExceptionType.MISSING, ExceptionStatus.RESOLVED,  3L, 3L));
        entityManager.persist(buildException(ExceptionType.DELAY,   ExceptionStatus.REJECTED,  4L, 4L));
        entityManager.flush();

        assertThat(exceptionRepository.findByStatus(ExceptionStatus.PENDING)).hasSize(1);
        assertThat(exceptionRepository.findByStatus(ExceptionStatus.IN_REVIEW)).hasSize(1);
        assertThat(exceptionRepository.findByStatus(ExceptionStatus.RESOLVED)).hasSize(1);
        assertThat(exceptionRepository.findByStatus(ExceptionStatus.REJECTED)).hasSize(1);
    }

    // -------------------------------------------------------------------------
    // findByType
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("findByType — returns only records with the given exception type")
    void testFindByType_MultipleResults() {
        entityManager.persist(buildException(ExceptionType.DELAY,   ExceptionStatus.PENDING,   1L, 1L));
        entityManager.persist(buildException(ExceptionType.DELAY,   ExceptionStatus.IN_REVIEW, 2L, 2L));
        entityManager.persist(buildException(ExceptionType.DAMAGE,  ExceptionStatus.RESOLVED,  3L, 3L));
        entityManager.persist(buildException(ExceptionType.MISSING, ExceptionStatus.REJECTED,  4L, 4L));
        entityManager.flush();

        List<ExceptionRecord> delays  = exceptionRepository.findByType(ExceptionType.DELAY);
        List<ExceptionRecord> damages = exceptionRepository.findByType(ExceptionType.DAMAGE);
        List<ExceptionRecord> missing = exceptionRepository.findByType(ExceptionType.MISSING);

        assertThat(delays).hasSize(2);
        assertThat(delays).allMatch(e -> e.getType() == ExceptionType.DELAY);
        assertThat(damages).hasSize(1);
        assertThat(missing).hasSize(1);
    }

    @Test
    @DisplayName("findByType — returns empty list when no records match the type")
    void testFindByType_NoResults() {
        entityManager.persist(buildException(ExceptionType.DELAY, ExceptionStatus.PENDING, 1L, 1L));
        entityManager.flush();

        assertThat(exceptionRepository.findByType(ExceptionType.MISSING)).isEmpty();
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Update exception record — persists changed status and description")
    void testUpdateException() {
        ExceptionRecord record = buildException(ExceptionType.DELAY, ExceptionStatus.PENDING, 100L, 5L);
        entityManager.persist(record);
        entityManager.flush();

        record.setStatus(ExceptionStatus.RESOLVED);
        record.setDescription("Resolved after investigation");
        exceptionRepository.save(record);
        entityManager.flush();
        entityManager.clear(); // Detach to force reload from DB

        Optional<ExceptionRecord> updated = exceptionRepository.findById(record.getExceptionID());
        assertThat(updated).isPresent();
        assertThat(updated.get().getStatus()).isEqualTo(ExceptionStatus.RESOLVED);
        assertThat(updated.get().getDescription()).isEqualTo("Resolved after investigation");
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Delete exception record by ID — record no longer exists")
    void testDeleteById() {
        ExceptionRecord record = buildException(ExceptionType.DAMAGE, ExceptionStatus.PENDING, 10L, 1L);
        entityManager.persist(record);
        entityManager.flush();

        Long id = record.getExceptionID();
        exceptionRepository.deleteById(id);
        entityManager.flush();

        assertThat(exceptionRepository.findById(id)).isNotPresent();
    }

    @Test
    @DisplayName("Delete exception record entity — record no longer exists")
    void testDeleteEntity() {
        ExceptionRecord record = buildException(ExceptionType.MISSING, ExceptionStatus.REJECTED, 20L, 2L);
        entityManager.persist(record);
        entityManager.flush();

        Long id = record.getExceptionID();
        exceptionRepository.delete(record);
        entityManager.flush();

        assertThat(exceptionRepository.findById(id)).isNotPresent();
    }

    // -------------------------------------------------------------------------
    // Count / ExistsById
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Count — returns the correct number of exception records")
    void testCount() {
        assertThat(exceptionRepository.count()).isZero();

        entityManager.persist(buildException(ExceptionType.DELAY,  ExceptionStatus.PENDING,   1L, 1L));
        entityManager.persist(buildException(ExceptionType.DAMAGE, ExceptionStatus.IN_REVIEW, 2L, 2L));
        entityManager.flush();

        assertThat(exceptionRepository.count()).isEqualTo(2);
    }

    @Test
    @DisplayName("ExistsById — true for existing ID, false for unknown ID")
    void testExistsById() {
        ExceptionRecord record = buildException(ExceptionType.DELAY, ExceptionStatus.PENDING, 1L, 1L);
        entityManager.persist(record);
        entityManager.flush();

        assertThat(exceptionRepository.existsById(record.getExceptionID())).isTrue();
        assertThat(exceptionRepository.existsById(9999L)).isFalse();
    }
}
