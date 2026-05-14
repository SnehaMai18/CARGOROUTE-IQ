package com.example.demo.repositories;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.example.demo.entities.Notification;
import com.example.demo.enums.NotificationCategory;

@SpringBootTest
class NotificationRepositoryTest {

    @Autowired
    private NotificationRepository repository;

    @BeforeEach
    void clean() {
        repository.deleteAll();
    }

    private Notification notification(Long userId, Long entityId, String message, NotificationCategory category, String status) {
        Notification n = new Notification();
        n.setUserID(userId);
        n.setEntityID(entityId);
        n.setMessage(message);
        n.setCategory(category);
        n.setStatus(status);
        return n;
    }

    @Test
    void save_shouldGenerateId() {
        Notification saved = repository.save(notification(10L, 1000L, "msg1", NotificationCategory.Pickup, "UNREAD"));

        assertNotNull(saved.getNotificationID());
    }

    @Test
    void save_shouldPersistMessage() {
        Notification saved = repository.save(notification(11L, 1100L, "delivered", NotificationCategory.Delivery, "READ"));

        Optional<Notification> found = repository.findById(saved.getNotificationID());

        assertTrue(found.isPresent());
        assertEquals("delivered", found.get().getMessage());
    }

    @Test
    void save_shouldPersistCategory() {
        Notification saved = repository.save(notification(12L, 1200L, "invoice", NotificationCategory.Invoice, "UNREAD"));

        Notification found = repository.findById(saved.getNotificationID()).orElseThrow();

        assertEquals(NotificationCategory.Invoice, found.getCategory());
    }

    @Test
    void save_shouldPersistStatus() {
        Notification saved = repository.save(notification(13L, 1300L, "exception", NotificationCategory.Exception, "READ"));

        Notification found = repository.findById(saved.getNotificationID()).orElseThrow();

        assertEquals("READ", found.getStatus());
    }

    @Test
    void save_shouldPersistUserId() {
        Notification saved = repository.save(notification(14L, 1400L, "u", NotificationCategory.Pickup, "UNREAD"));

        Notification found = repository.findById(saved.getNotificationID()).orElseThrow();

        assertEquals(14L, found.getUserID());
    }

    @Test
    void save_shouldPersistEntityId() {
        Notification saved = repository.save(notification(15L, 1500L, "e", NotificationCategory.Pickup, "UNREAD"));

        Notification found = repository.findById(saved.getNotificationID()).orElseThrow();

        assertEquals(1500L, found.getEntityID());
    }

    @Test
    void findById_shouldReturnEmptyForUnknownId() {
        Optional<Notification> found = repository.findById(999999L);

        assertTrue(found.isEmpty());
    }

    @Test
    void existsById_shouldReturnTrueForSavedEntity() {
        Notification saved = repository.save(notification(16L, 1600L, "exists", NotificationCategory.Delivery, "UNREAD"));

        assertTrue(repository.existsById(saved.getNotificationID()));
    }

    @Test
    void existsById_shouldReturnFalseForMissingEntity() {
        assertFalse(repository.existsById(123456L));
    }

    @Test
    void findAll_shouldReturnAllSavedEntities() {
        repository.save(notification(17L, 1700L, "a", NotificationCategory.Pickup, "UNREAD"));
        repository.save(notification(18L, 1800L, "b", NotificationCategory.Delivery, "READ"));

        List<Notification> all = repository.findAll();

        assertEquals(2, all.size());
    }

    @Test
    void deleteById_shouldRemoveEntity() {
        Notification saved = repository.save(notification(19L, 1900L, "delete", NotificationCategory.Invoice, "UNREAD"));

        repository.deleteById(saved.getNotificationID());

        assertFalse(repository.existsById(saved.getNotificationID()));
    }

    @Test
    void delete_shouldRemoveSpecificEntityOnly() {
        Notification one = repository.save(notification(20L, 2000L, "one", NotificationCategory.Pickup, "UNREAD"));
        Notification two = repository.save(notification(21L, 2100L, "two", NotificationCategory.Pickup, "UNREAD"));

        repository.delete(one);

        assertFalse(repository.existsById(one.getNotificationID()));
        assertTrue(repository.existsById(two.getNotificationID()));
    }

    @Test
    void deleteAll_shouldClearTable() {
        repository.save(notification(22L, 2200L, "a", NotificationCategory.Pickup, "UNREAD"));
        repository.save(notification(23L, 2300L, "b", NotificationCategory.Delivery, "READ"));

        repository.deleteAll();

        assertEquals(0, repository.count());
    }

    @Test
    void count_shouldIncreaseAfterInsert() {
        long before = repository.count();
        repository.save(notification(24L, 2400L, "c", NotificationCategory.Exception, "UNREAD"));
        long after = repository.count();

        assertEquals(before + 1, after);
    }

    @Test
    void saveAll_shouldPersistBatch() {
        List<Notification> batch = List.of(
            notification(25L, 2500L, "b1", NotificationCategory.Pickup, "UNREAD"),
            notification(26L, 2600L, "b2", NotificationCategory.Invoice, "READ")
        );

        List<Notification> saved = repository.saveAll(batch);

        assertEquals(2, saved.size());
        assertTrue(saved.stream().allMatch(n -> n.getNotificationID() != null));
    }

    @Test
    void saveAllAndFlush_shouldPersistImmediately() {
        repository.saveAllAndFlush(List.of(
            notification(27L, 2700L, "f1", NotificationCategory.Delivery, "UNREAD"),
            notification(28L, 2800L, "f2", NotificationCategory.Exception, "READ")
        ));

        assertEquals(2, repository.count());
    }

    @Test
    void findAllById_shouldReturnMatchingSubset() {
        Notification a = repository.save(notification(29L, 2900L, "a", NotificationCategory.Pickup, "UNREAD"));
        Notification b = repository.save(notification(30L, 3000L, "b", NotificationCategory.Delivery, "READ"));

        List<Notification> subset = repository.findAllById(List.of(a.getNotificationID(), 999999L, b.getNotificationID()));

        assertEquals(2, subset.size());
    }

    @Test
    void flush_shouldNotThrowAfterSave() {
        repository.save(notification(31L, 3100L, "flush", NotificationCategory.Invoice, "UNREAD"));

        assertDoesNotThrow(() -> repository.flush());
    }

    @Test
    void saveAndFlush_shouldReturnManagedEntity() {
        Notification saved = repository.saveAndFlush(notification(32L, 3200L, "saf", NotificationCategory.Pickup, "READ"));

        assertNotNull(saved.getNotificationID());
        assertEquals("saf", saved.getMessage());
    }

    @Test
    void getReferenceById_shouldReturnProxyForExistingId() {
        Notification saved = repository.save(notification(33L, 3300L, "proxy", NotificationCategory.Exception, "UNREAD"));

        Notification ref = repository.getReferenceById(saved.getNotificationID());

        assertEquals(saved.getNotificationID(), ref.getNotificationID());
    }

    @Test
    void save_shouldAutoPopulateCreatedAt() {
        Notification saved = repository.saveAndFlush(notification(34L, 3400L, "createdAt", NotificationCategory.Pickup, "UNREAD"));

        assertNotNull(saved.getCreatedAt());
    }

    @Test
    void createdAt_shouldBeRecentTimestamp() {
        LocalDateTime before = LocalDateTime.now().minusMinutes(1);
        Notification saved = repository.saveAndFlush(notification(35L, 3500L, "recent", NotificationCategory.Delivery, "UNREAD"));

        assertTrue(saved.getCreatedAt().isAfter(before));
    }
}
