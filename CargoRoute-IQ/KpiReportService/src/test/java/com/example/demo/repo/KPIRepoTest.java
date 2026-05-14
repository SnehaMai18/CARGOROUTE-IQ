package com.example.demo.repo;

import com.example.demo.entity.KPI;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class KPIRepoTest {

    @Autowired
    private KPIRepo kpiRepo;

    private KPI kpi;

    @BeforeEach
    void setUp() {
        kpiRepo.deleteAll();

        kpi = new KPI();
        kpi.setName("On-Time Delivery");
        kpi.setDefinition("Percentage of deliveries completed on time");
        kpi.setTarget(95.0);
        kpi.setCurrentValue(88.5);
        kpi.setReportingPeriod("Monthly");
    }

    @Test
    void testSaveKPI() {
        KPI saved = kpiRepo.save(kpi);

        assertThat(saved).isNotNull();
        assertThat(saved.getKPIID()).isNotNull();
        assertThat(saved.getName()).isEqualTo("On-Time Delivery");
    }

    @Test
    void testFindById() {
        KPI saved = kpiRepo.save(kpi);
        Optional<KPI> found = kpiRepo.findById(saved.getKPIID());
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("On-Time Delivery");
    }

    @Test
    void testFindAllKPIs() {
        KPI kpi2 = new KPI();
        kpi2.setName("Revenue Growth");
        kpi2.setDefinition("Year-over-year revenue increase");
        kpi2.setTarget(10.0);
        kpi2.setCurrentValue(7.5);
        kpi2.setReportingPeriod("Quarterly");

        kpiRepo.save(kpi);
        kpiRepo.save(kpi2);

        List<KPI> all = kpiRepo.findAll();

        assertThat(all).hasSize(2);
        assertThat(all).extracting(KPI::getName)
                       .containsExactlyInAnyOrder("On-Time Delivery", "Revenue Growth");
    }

    @Test
    void testUpdateKPI() {
        KPI saved = kpiRepo.save(kpi);
        saved.setCurrentValue(92.0);
        saved.setReportingPeriod("Weekly");
        KPI updated = kpiRepo.save(saved);
        assertThat(updated.getCurrentValue()).isEqualTo(92.0);
        assertThat(updated.getReportingPeriod()).isEqualTo("Weekly");
    }

    @Test
    void testDeleteById() {
        KPI saved = kpiRepo.save(kpi);
        Long id = saved.getKPIID();
        kpiRepo.deleteById(id);
        Optional<KPI> deleted = kpiRepo.findById(id);
        assertThat(deleted).isNotPresent();
    }

    @Test
    void testCountAndDeleteAll() {
        kpiRepo.save(kpi);
        assertThat(kpiRepo.count()).isEqualTo(1L);
        kpiRepo.deleteAll();
        assertThat(kpiRepo.findAll()).isEmpty();
    }

    @Test
    void findByName_and_findAllByName_work() {
        KPI k = new KPI();
        k.setName("Utilization");
        k.setDefinition("def");
        k.setTarget(90.0);
        k.setCurrentValue(88.0);
        kpiRepo.save(k);

        var opt = kpiRepo.findByName("Utilization");
        assertThat(opt).isPresent();

        var list = kpiRepo.findAllByName("Utilization");
        assertThat(list).isNotEmpty();
    }

    @Test
    void testFindByIdNotFound() {
        Optional<KPI> found = kpiRepo.findById(999L);
        assertThat(found).isNotPresent();
    }
}
