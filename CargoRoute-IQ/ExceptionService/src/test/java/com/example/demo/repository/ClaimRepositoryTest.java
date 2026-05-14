package com.example.demo.repository;

import com.example.demo.entity.Claim;
import com.example.demo.entity.ExceptionRecord;
import com.example.demo.entity.enums.ClaimStatus;
import com.example.demo.entity.enums.ExceptionStatus;
import com.example.demo.entity.enums.ExceptionType;
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

/**
 * Repository slice tests for {@link ClaimRepository}.
 *
 * Uses @DataJpaTest which:
 *  - Spins up an H2 in-memory database (replaces MySQL datasource)
 *  - Wraps every test in a transaction that is rolled back after each test
 *
 * Note: Claim has a @OneToOne(nullable=false) to ExceptionRecord, so each
 * test that persists a Claim must first persist a parent ExceptionRecord.
 */
@DataJpaTest
@TestPropertySource(properties = {
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "eureka.client.enabled=false"
})
class ClaimRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ClaimRepository claimRepository;

    /** A shared parent ExceptionRecord available to all tests. */
    private ExceptionRecord parentException;

    // -------------------------------------------------------------------------
    // Setup
    // -------------------------------------------------------------------------

    @BeforeEach
    void setUp() {
        parentException = new ExceptionRecord();
        parentException.setType(ExceptionType.DELAY);
        parentException.setStatus(ExceptionStatus.PENDING);
        parentException.setBookingId(100L);
        parentException.setReportedBy(1L);
        parentException.setDescription("Base exception for claim tests");
        entityManager.persist(parentException);
        entityManager.flush();
    }

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    private Claim buildClaim(ExceptionRecord exceptionRecord, ClaimStatus status, Long filedBy, Double amount) {
        Claim claim = new Claim();
        claim.setExceptionRecord(exceptionRecord);
        claim.setStatus(status);
        claim.setFiledBy(filedBy);
        claim.setAmountClaimed(amount);
        claim.setResolutionNotes("Notes for " + status.name());
        return claim;
    }

    private ExceptionRecord persistNewException(ExceptionType type, ExceptionStatus status, Long bookingId) {
        ExceptionRecord record = new ExceptionRecord();
        record.setType(type);
        record.setStatus(status);
        record.setBookingId(bookingId);
        record.setReportedBy(2L);
        record.setDescription("Extra exception: " + type.name());
        return entityManager.persist(record);
    }

    // -------------------------------------------------------------------------
    // Save / Find by ID
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Save a claim — persists and auto-generates ID")
    void testSaveClaim() {
        Claim claim = buildClaim(parentException, ClaimStatus.OPEN, 1L, 1500.00);

        Claim saved = claimRepository.save(claim);

        assertThat(saved).isNotNull();
        assertThat(saved.getClaimID()).isNotNull().isPositive();
        assertThat(saved.getStatus()).isEqualTo(ClaimStatus.OPEN);
        assertThat(saved.getFiledBy()).isEqualTo(1L);
        assertThat(saved.getAmountClaimed()).isEqualTo(1500.00);
        assertThat(saved.getExceptionRecord()).isNotNull();
        assertThat(saved.getExceptionRecord().getExceptionID()).isEqualTo(parentException.getExceptionID());
    }

    @Test
    @DisplayName("Find claim by ID — returns the correct claim")
    void testFindById_Found() {
        Claim claim = buildClaim(parentException, ClaimStatus.UNDER_REVIEW, 2L, 2500.00);
        entityManager.persist(claim);
        entityManager.flush();

        Optional<Claim> found = claimRepository.findById(claim.getClaimID());

        assertThat(found).isPresent();
        assertThat(found.get().getClaimID()).isEqualTo(claim.getClaimID());
        assertThat(found.get().getStatus()).isEqualTo(ClaimStatus.UNDER_REVIEW);
        assertThat(found.get().getFiledBy()).isEqualTo(2L);
    }

    @Test
    @DisplayName("Find claim by non-existent ID — returns empty Optional")
    void testFindById_NotFound() {
        Optional<Claim> found = claimRepository.findById(9999L);

        assertThat(found).isNotPresent();
    }

    // -------------------------------------------------------------------------
    // Find All
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Find all claims — returns all persisted claims")
    void testFindAll() {
        ExceptionRecord ex2 = persistNewException(ExceptionType.DAMAGE, ExceptionStatus.IN_REVIEW, 200L);
        ExceptionRecord ex3 = persistNewException(ExceptionType.MISSING, ExceptionStatus.RESOLVED, 300L);
        entityManager.flush();

        entityManager.persist(buildClaim(parentException, ClaimStatus.OPEN,         1L, 100.0));
        entityManager.persist(buildClaim(ex2,             ClaimStatus.SETTLED,       2L, 200.0));
        entityManager.persist(buildClaim(ex3,             ClaimStatus.UNDER_REVIEW,  3L, 300.0));
        entityManager.flush();

        List<Claim> all = claimRepository.findAll();

        assertThat(all).hasSize(3);
    }

    @Test
    @DisplayName("Find all claims — returns empty list when none exist")
    void testFindAll_Empty() {
        assertThat(claimRepository.findAll()).isEmpty();
    }

    // -------------------------------------------------------------------------
    // findByExceptionRecord_ExceptionID
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("findByExceptionRecord_ExceptionID — returns claims for the given exception")
    void testFindByExceptionRecordID_Found() {
        Claim claim = buildClaim(parentException, ClaimStatus.OPEN, 1L, 750.0);
        entityManager.persist(claim);
        entityManager.flush();

        List<Claim> found = claimRepository.findByExceptionRecord_ExceptionID(parentException.getExceptionID());

        assertThat(found).hasSize(1);
        assertThat(found.get(0).getClaimID()).isEqualTo(claim.getClaimID());
        assertThat(found.get(0).getFiledBy()).isEqualTo(1L);
    }

    @Test
    @DisplayName("findByExceptionRecord_ExceptionID — returns empty list for unknown exception ID")
    void testFindByExceptionRecordID_NotFound() {
        assertThat(claimRepository.findByExceptionRecord_ExceptionID(9999L)).isEmpty();
    }

    // -------------------------------------------------------------------------
    // findByStatus
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("findByStatus — returns only claims with the given status")
    void testFindByStatus_MultipleResults() {
        ExceptionRecord ex2 = persistNewException(ExceptionType.DAMAGE, ExceptionStatus.IN_REVIEW, 200L);
        ExceptionRecord ex3 = persistNewException(ExceptionType.MISSING, ExceptionStatus.RESOLVED, 300L);
        entityManager.flush();

        entityManager.persist(buildClaim(parentException, ClaimStatus.OPEN, 1L, 100.0));
        entityManager.persist(buildClaim(ex2,             ClaimStatus.OPEN, 2L, 200.0));
        entityManager.persist(buildClaim(ex3,             ClaimStatus.SETTLED, 3L, 300.0));
        entityManager.flush();

        List<Claim> open    = claimRepository.findByStatus(ClaimStatus.OPEN);
        List<Claim> settled = claimRepository.findByStatus(ClaimStatus.SETTLED);

        assertThat(open).hasSize(2);
        assertThat(open).allMatch(c -> c.getStatus() == ClaimStatus.OPEN);
        assertThat(settled).hasSize(1);
        assertThat(settled.get(0).getFiledBy()).isEqualTo(3L);
    }

    @Test
    @DisplayName("findByStatus — returns empty list when no claims match")
    void testFindByStatus_NoResults() {
        entityManager.persist(buildClaim(parentException, ClaimStatus.OPEN, 1L, 100.0));
        entityManager.flush();

        assertThat(claimRepository.findByStatus(ClaimStatus.DENIED)).isEmpty();
    }

    @Test
    @DisplayName("findByStatus — correctly returns each distinct ClaimStatus")
    void testFindByStatus_AllStatuses() {
        ExceptionRecord ex2 = persistNewException(ExceptionType.DAMAGE,  ExceptionStatus.IN_REVIEW, 201L);
        ExceptionRecord ex3 = persistNewException(ExceptionType.MISSING, ExceptionStatus.RESOLVED,  202L);
        ExceptionRecord ex4 = persistNewException(ExceptionType.DELAY,   ExceptionStatus.REJECTED,  203L);
        ExceptionRecord ex5 = persistNewException(ExceptionType.DAMAGE,  ExceptionStatus.PENDING,   204L);
        entityManager.flush();

        entityManager.persist(buildClaim(parentException, ClaimStatus.OPEN,         1L, 100.0));
        entityManager.persist(buildClaim(ex2,             ClaimStatus.UNDER_REVIEW,  2L, 200.0));
        entityManager.persist(buildClaim(ex3,             ClaimStatus.SETTLED,       3L, 300.0));
        entityManager.persist(buildClaim(ex4,             ClaimStatus.DENIED,        4L, 400.0));
        entityManager.persist(buildClaim(ex5,             ClaimStatus.CANCELLED,     5L, 500.0));
        entityManager.flush();

        assertThat(claimRepository.findByStatus(ClaimStatus.OPEN)).hasSize(1);
        assertThat(claimRepository.findByStatus(ClaimStatus.UNDER_REVIEW)).hasSize(1);
        assertThat(claimRepository.findByStatus(ClaimStatus.SETTLED)).hasSize(1);
        assertThat(claimRepository.findByStatus(ClaimStatus.DENIED)).hasSize(1);
        assertThat(claimRepository.findByStatus(ClaimStatus.CANCELLED)).hasSize(1);
    }

    // -------------------------------------------------------------------------
    // Update
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Update claim — persists changed status and resolution notes")
    void testUpdateClaim() {
        Claim claim = buildClaim(parentException, ClaimStatus.OPEN, 1L, 1000.0);
        entityManager.persist(claim);
        entityManager.flush();

        claim.setStatus(ClaimStatus.SETTLED);
        claim.setResolutionNotes("Claim settled in full");
        claimRepository.save(claim);
        entityManager.flush();
        entityManager.clear(); // Detach to force reload from DB

        Optional<Claim> updated = claimRepository.findById(claim.getClaimID());
        assertThat(updated).isPresent();
        assertThat(updated.get().getStatus()).isEqualTo(ClaimStatus.SETTLED);
        assertThat(updated.get().getResolutionNotes()).isEqualTo("Claim settled in full");
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Delete claim by ID — claim no longer exists")
    void testDeleteById() {
        Claim claim = buildClaim(parentException, ClaimStatus.OPEN, 1L, 500.0);
        entityManager.persist(claim);
        entityManager.flush();

        Long id = claim.getClaimID();
        claimRepository.deleteById(id);
        entityManager.flush();

        assertThat(claimRepository.findById(id)).isNotPresent();
    }

    @Test
    @DisplayName("Delete claim entity — claim no longer exists")
    void testDeleteEntity() {
        Claim claim = buildClaim(parentException, ClaimStatus.CANCELLED, 2L, 600.0);
        entityManager.persist(claim);
        entityManager.flush();

        Long id = claim.getClaimID();
        claimRepository.delete(claim);
        entityManager.flush();

        assertThat(claimRepository.findById(id)).isNotPresent();
    }

    // -------------------------------------------------------------------------
    // Count / ExistsById
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Count — returns the correct number of claims")
    void testCount() {
        assertThat(claimRepository.count()).isZero();

        ExceptionRecord ex2 = persistNewException(ExceptionType.DAMAGE, ExceptionStatus.IN_REVIEW, 200L);
        entityManager.flush();

        entityManager.persist(buildClaim(parentException, ClaimStatus.OPEN,     1L, 100.0));
        entityManager.persist(buildClaim(ex2,             ClaimStatus.SETTLED,   2L, 200.0));
        entityManager.flush();

        assertThat(claimRepository.count()).isEqualTo(2);
    }

    @Test
    @DisplayName("ExistsById — true for existing ID, false for unknown ID")
    void testExistsById() {
        Claim claim = buildClaim(parentException, ClaimStatus.OPEN, 1L, 100.0);
        entityManager.persist(claim);
        entityManager.flush();

        assertThat(claimRepository.existsById(claim.getClaimID())).isTrue();
        assertThat(claimRepository.existsById(9999L)).isFalse();
    }
}
