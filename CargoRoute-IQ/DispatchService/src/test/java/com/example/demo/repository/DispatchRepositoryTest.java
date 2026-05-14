package com.example.demo.repository;


import com.example.demo.entities.Dispatch;
import com.example.demo.entities.enums.DispatchStatus;

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
class DispatchRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private DispatchRepository dispatchRepository;

    private Dispatch dispatch1;
    private Dispatch dispatch2;
    private Dispatch dispatch3;

    @BeforeEach
    void setUp() {

        dispatch1 = buildDispatch(1001L, 501L, "Alice", DispatchStatus.ASSIGNED);
        dispatch2 = buildDispatch(1002L, 502L, "Bob", DispatchStatus.IN_PROGRESS);
        dispatch3 = buildDispatch(1003L, 503L, "Alice", DispatchStatus.ASSIGNED);

        entityManager.persist(dispatch1);
        entityManager.persist(dispatch2);
        entityManager.persist(dispatch3);
        entityManager.flush();
    }

    private Dispatch buildDispatch(
            Long loadId,
            Long driverId,
            String assignedBy,
            DispatchStatus status
    ) {
        Dispatch dispatch = new Dispatch();
        dispatch.setLoadID(loadId);
        dispatch.setAssignedDriverID(driverId);
        dispatch.setAssignedBy(assignedBy);
        dispatch.setAssignedAt(LocalDateTime.now());
        dispatch.setStatus(status);
        return dispatch;
    }

    // ───────────────── Save / FindById ─────────────────

    @Test
    @DisplayName("Save dispatch — auto-generates ID")
    void testSaveDispatch() {

        Dispatch dispatch = buildDispatch(
                2001L, 601L, "Charlie", DispatchStatus.CREATED
        );

        Dispatch saved = dispatchRepository.save(dispatch);

        assertThat(saved).isNotNull();
        assertThat(saved.getDispatchID()).isNotNull().isPositive();
        assertThat(saved.getAssignedBy()).isEqualTo("Charlie");
        assertThat(saved.getStatus()).isEqualTo(DispatchStatus.CREATED);
    }

    @Test
    @DisplayName("Find dispatch by ID — found")
    void testFindById_Found() {

        Optional<Dispatch> found =
                dispatchRepository.findById(dispatch1.getDispatchID());

        assertThat(found).isPresent();
        assertThat(found.get().getAssignedBy()).isEqualTo("Alice");
    }

    @Test
    @DisplayName("Find dispatch by ID — not found")
    void testFindById_NotFound() {

        Optional<Dispatch> found =
                dispatchRepository.findById(9999L);

        assertThat(found).isNotPresent();
    }

    // ───────────────── Find All ─────────────────

    @Test
    @DisplayName("Find all dispatches")
    void testFindAll() {

        List<Dispatch> all = dispatchRepository.findAll();
        assertThat(all).hasSize(3);
    }

    // ───────────────── findByLoadID ─────────────────

    @Test
    @DisplayName("findByLoadID — returns matching dispatch")
    void testFindByLoadID() {

        Dispatch result =
                dispatchRepository.findByLoadID(1001L);

        assertThat(result).isNotNull();
        assertThat(result.getAssignedBy()).isEqualTo("Alice");
    }

    // ───────────────── findByAssignedBy ─────────────────

    @Test
    @DisplayName("findByAssignedBy — returns matches")
    void testFindByAssignedBy() {

        List<Dispatch> results =
                dispatchRepository.findByAssignedBy("Alice");

        assertThat(results).hasSize(2);
        assertThat(results)
                .allMatch(d -> d.getAssignedBy().equals("Alice"));
    }

    @Test
    @DisplayName("findByAssignedBy — empty result")
    void testFindByAssignedBy_NoResults() {

        List<Dispatch> results =
                dispatchRepository.findByAssignedBy("Unknown");

        assertThat(results).isEmpty();
    }

    // ───────────────── findByStatus ─────────────────

    @Test
    @DisplayName("findByStatus — ASSIGNED")
    void testFindByStatus_Assigned() {

        List<Dispatch> assigned =
                dispatchRepository.findByStatus(DispatchStatus.ASSIGNED);

        assertThat(assigned).hasSize(2);
        assertThat(assigned)
                .allMatch(d -> d.getStatus() == DispatchStatus.ASSIGNED);
    }

    @Test
    @DisplayName("findByStatus — IN_PROGRESS")
    void testFindByStatus_InProgress() {

        List<Dispatch> inProgress =
                dispatchRepository.findByStatus(DispatchStatus.IN_PROGRESS);

        assertThat(inProgress).hasSize(1);
        assertThat(inProgress.get(0).getAssignedBy()).isEqualTo("Bob");
    }

    @Test
    @DisplayName("findByStatus — empty result")
    void testFindByStatus_NoResults() {

        List<Dispatch> cancelled =
                dispatchRepository.findByStatus(DispatchStatus.CANCELLED);

        assertThat(cancelled).isEmpty();
    }

    // ───────────────── Delete / Count / Exists ─────────────────

    @Test
    @DisplayName("Delete dispatch by ID")
    void testDeleteById() {

        Long id = dispatch2.getDispatchID();

        dispatchRepository.deleteById(id);
        entityManager.flush();

        assertThat(dispatchRepository.findById(id)).isNotPresent();
    }

    @Test
    @DisplayName("Count dispatches")
    void testCount() {

        assertThat(dispatchRepository.count()).isEqualTo(3);
    }

    @Test
    @DisplayName("ExistsById — true & false cases")
    void testExistsById() {

        assertThat(dispatchRepository.existsById(
                dispatch1.getDispatchID())).isTrue();

        assertThat(dispatchRepository.existsById(8888L)).isFalse();
    }
}