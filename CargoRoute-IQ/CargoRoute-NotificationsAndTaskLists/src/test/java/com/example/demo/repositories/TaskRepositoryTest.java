package com.example.demo.repositories;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.demo.entities.Task;

@SpringBootTest
class TaskRepositoryTest {

    @Autowired
    private TaskRepository repository;

    @BeforeEach
    void clean() {
        repository.deleteAll();
    }

    private Task task(Long assignedTo, Long entityId, String description, LocalDate dueDate, String status) {
        Task t = new Task();
        t.setAssignedTo(assignedTo);
        t.setRelatedEntityID(entityId);
        t.setDescription(description);
        t.setDueDate(dueDate);
        t.setStatus(status);
        return t;
    }

    @Test
    void save_shouldGenerateId() {
        Task saved = repository.save(task(10L, 1000L, "t1", LocalDate.of(2026, 4, 20), "PENDING"));

        assertNotNull(saved.getTaskID());
    }

    @Test
    void save_shouldPersistAssignedTo() {
        Task saved = repository.save(task(11L, 1100L, "t2", LocalDate.of(2026, 4, 21), "PENDING"));

        Task found = repository.findById(saved.getTaskID()).orElseThrow();

        assertEquals(11L, found.getAssignedTo());
    }

    @Test
    void save_shouldPersistRelatedEntityId() {
        Task saved = repository.save(task(12L, 1200L, "t3", LocalDate.of(2026, 4, 22), "PENDING"));

        Task found = repository.findById(saved.getTaskID()).orElseThrow();

        assertEquals(1200L, found.getRelatedEntityID());
    }

    @Test
    void save_shouldPersistDescription() {
        Task saved = repository.save(task(13L, 1300L, "verify labels", LocalDate.of(2026, 4, 23), "PENDING"));

        Task found = repository.findById(saved.getTaskID()).orElseThrow();

        assertEquals("verify labels", found.getDescription());
    }

    @Test
    void save_shouldPersistDueDate() {
        LocalDate due = LocalDate.of(2026, 4, 24);
        Task saved = repository.save(task(14L, 1400L, "due date", due, "PENDING"));

        Task found = repository.findById(saved.getTaskID()).orElseThrow();

        assertEquals(due, found.getDueDate());
    }

    @Test
    void save_shouldPersistStatus() {
        Task saved = repository.save(task(15L, 1500L, "status", LocalDate.of(2026, 4, 25), "COMPLETED"));

        Task found = repository.findById(saved.getTaskID()).orElseThrow();

        assertEquals("COMPLETED", found.getStatus());
    }

    @Test
    void findById_shouldReturnEmptyForUnknownId() {
        Optional<Task> found = repository.findById(888888L);

        assertTrue(found.isEmpty());
    }

    @Test
    void existsById_shouldReturnTrueWhenSaved() {
        Task saved = repository.save(task(16L, 1600L, "exists", LocalDate.of(2026, 4, 26), "PENDING"));

        assertTrue(repository.existsById(saved.getTaskID()));
    }

    @Test
    void existsById_shouldReturnFalseWhenMissing() {
        assertFalse(repository.existsById(777777L));
    }

    @Test
    void findAll_shouldReturnAllRows() {
        repository.save(task(17L, 1700L, "a", LocalDate.of(2026, 4, 27), "PENDING"));
        repository.save(task(18L, 1800L, "b", LocalDate.of(2026, 4, 28), "CANCELLED"));

        List<Task> all = repository.findAll();

        assertEquals(2, all.size());
    }

    @Test
    void deleteById_shouldRemoveEntity() {
        Task saved = repository.save(task(19L, 1900L, "delete", LocalDate.of(2026, 4, 29), "PENDING"));

        repository.deleteById(saved.getTaskID());

        assertFalse(repository.existsById(saved.getTaskID()));
    }

    @Test
    void delete_shouldRemoveOnlyTargetEntity() {
        Task one = repository.save(task(20L, 2000L, "one", LocalDate.of(2026, 4, 30), "PENDING"));
        Task two = repository.save(task(21L, 2100L, "two", LocalDate.of(2026, 5, 1), "PENDING"));

        repository.delete(one);

        assertFalse(repository.existsById(one.getTaskID()));
        assertTrue(repository.existsById(two.getTaskID()));
    }

    @Test
    void deleteAll_shouldRemoveEverything() {
        repository.save(task(22L, 2200L, "x", LocalDate.of(2026, 5, 2), "PENDING"));
        repository.save(task(23L, 2300L, "y", LocalDate.of(2026, 5, 3), "PENDING"));

        repository.deleteAll();

        assertEquals(0, repository.count());
    }

    @Test
    void count_shouldIncreaseAfterSave() {
        long before = repository.count();
        repository.save(task(24L, 2400L, "cnt", LocalDate.of(2026, 5, 4), "PENDING"));
        long after = repository.count();

        assertEquals(before + 1, after);
    }

    @Test
    void saveAll_shouldPersistBatch() {
        List<Task> batch = List.of(
            task(25L, 2500L, "b1", LocalDate.of(2026, 5, 5), "PENDING"),
            task(26L, 2600L, "b2", LocalDate.of(2026, 5, 6), "COMPLETED")
        );

        List<Task> saved = repository.saveAll(batch);

        assertEquals(2, saved.size());
        assertTrue(saved.stream().allMatch(t -> t.getTaskID() != null));
    }

    @Test
    void saveAllAndFlush_shouldPersistBatchImmediately() {
        repository.saveAllAndFlush(List.of(
            task(27L, 2700L, "f1", LocalDate.of(2026, 5, 7), "PENDING"),
            task(28L, 2800L, "f2", LocalDate.of(2026, 5, 8), "CANCELLED")
        ));

        assertEquals(2, repository.count());
    }

    @Test
    void findAllById_shouldReturnOnlyExistingRows() {
        Task a = repository.save(task(29L, 2900L, "a", LocalDate.of(2026, 5, 9), "PENDING"));
        Task b = repository.save(task(30L, 3000L, "b", LocalDate.of(2026, 5, 10), "PENDING"));

        List<Task> subset = repository.findAllById(List.of(a.getTaskID(), 999999L, b.getTaskID()));

        assertEquals(2, subset.size());
    }

    @Test
    void flush_shouldNotThrowAfterSave() {
        repository.save(task(31L, 3100L, "flush", LocalDate.of(2026, 5, 11), "PENDING"));

        assertDoesNotThrow(() -> repository.flush());
    }

    @Test
    void saveAndFlush_shouldReturnPersistedEntity() {
        Task saved = repository.saveAndFlush(task(32L, 3200L, "saf", LocalDate.of(2026, 5, 12), "PENDING"));

        assertNotNull(saved.getTaskID());
        assertEquals("saf", saved.getDescription());
    }

    @Test
    void getReferenceById_shouldExposeIdForExistingEntity() {
        Task saved = repository.save(task(33L, 3300L, "proxy", LocalDate.of(2026, 5, 13), "PENDING"));

        Task ref = repository.getReferenceById(saved.getTaskID());

        assertEquals(saved.getTaskID(), ref.getTaskID());
    }

    @Test
    void save_shouldPersistCancelledStatus() {
        Task saved = repository.save(task(34L, 3400L, "cancelled", LocalDate.of(2026, 5, 14), "CANCELLED"));

        Task found = repository.findById(saved.getTaskID()).orElseThrow();

        assertEquals("CANCELLED", found.getStatus());
    }

    @Test
    void save_shouldPersistFutureDate() {
        LocalDate future = LocalDate.of(2030, 1, 1);
        Task saved = repository.save(task(35L, 3500L, "future", future, "PENDING"));

        Task found = repository.findById(saved.getTaskID()).orElseThrow();

        assertEquals(future, found.getDueDate());
    }
}
