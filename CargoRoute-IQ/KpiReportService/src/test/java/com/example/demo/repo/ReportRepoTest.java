package com.example.demo.repo;

import com.example.demo.entity.Report;
import com.example.demo.enums.ReportScope;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ReportRepoTest {

    @Autowired
    private ReportRepo reportRepo;

    private Report report;

    @BeforeEach
    void setUp() {
        reportRepo.deleteAll();

        report = new Report();
        report.setScope(ReportScope.ONTIME);
        report.setParametersJSON("{\"route\":\"NYC-LA\"}");
        report.setMetricsJSON("{\"onTimeRate\":88.5}");
        report.setGeneratedBy("admin");
        report.setGeneratedAt(LocalDateTime.of(2026, 4, 13, 10, 0));
    }

    @Test
    void testSaveReport() {
        Report saved = reportRepo.save(report);

        assertThat(saved).isNotNull();
        assertThat(saved.getReportID()).isNotNull();
        assertThat(saved.getScope()).isEqualTo(ReportScope.ONTIME);
        assertThat(saved.getGeneratedBy()).isEqualTo("admin");
    }

    @Test
    void testFindById() {
        Report saved = reportRepo.save(report);

        Optional<Report> found = reportRepo.findById(saved.getReportID());

        assertThat(found).isPresent();
        assertThat(found.get().getScope()).isEqualTo(ReportScope.ONTIME);
        assertThat(found.get().getParametersJSON()).isEqualTo("{\"route\":\"NYC-LA\"}");
        assertThat(found.get().getMetricsJSON()).isEqualTo("{\"onTimeRate\":88.5}");
    }

    @Test
    void testFindAllReports() {
        Report report2 = new Report();
        report2.setScope(ReportScope.REVENUE);
        report2.setParametersJSON("{\"region\":\"North\"}");
        report2.setMetricsJSON("{\"revenue\":50000.0}");
        report2.setGeneratedBy("manager");
        report2.setGeneratedAt(LocalDateTime.of(2026, 4, 13, 11, 0));

        reportRepo.save(report);
        reportRepo.save(report2);

        List<Report> all = reportRepo.findAll();

        assertThat(all).hasSize(2);
        assertThat(all).extracting(Report::getScope)
                       .containsExactlyInAnyOrder(ReportScope.ONTIME, ReportScope.REVENUE);
    }

    @Test
    void testUpdateReport() {
        Report saved = reportRepo.save(report);

        saved.setGeneratedBy("supervisor");
        Report updated = reportRepo.save(saved);

        assertThat(updated.getGeneratedBy()).isEqualTo("supervisor");
    }

    @Test
    void testDeleteById() {
        Report saved = reportRepo.save(report);
        Long id = saved.getReportID();

        reportRepo.deleteById(id);

        Optional<Report> deleted = reportRepo.findById(id);
        assertThat(deleted).isNotPresent();
    }

    @Test
    void testDeleteAll() {
        reportRepo.save(report);

        reportRepo.deleteAll();

        assertThat(reportRepo.findAll()).isEmpty();
    }

    @Test
    void testCount() {
        reportRepo.save(report);

        long count = reportRepo.count();

        assertThat(count).isEqualTo(1L);
    }

    @Test
    void testAllReportScopeValues() {
        for (ReportScope scope : ReportScope.values()) {
            Report r = new Report();
            r.setScope(scope);
            r.setGeneratedBy("system");
            r.setGeneratedAt(LocalDateTime.now());

            Report saved = reportRepo.save(r);
            assertThat(saved.getScope()).isEqualTo(scope);
        }

        assertThat(reportRepo.count()).isEqualTo(ReportScope.values().length);
    }

    @Test
    void testFindByIdNotFound() {
        Optional<Report> found = reportRepo.findById(999L);

        assertThat(found).isNotPresent();
    }
}
