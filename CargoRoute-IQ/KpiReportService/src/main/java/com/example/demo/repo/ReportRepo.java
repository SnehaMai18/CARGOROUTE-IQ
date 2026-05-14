
package com.example.demo.repo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Report;
import com.example.demo.enums.ReportScope;

public interface ReportRepo extends JpaRepository<Report, Long> {

    List<Report> findByScope(ReportScope scope);

    List<Report> findByScopeAndGeneratedAtBetween(
            ReportScope scope,
            LocalDateTime from,
            LocalDateTime to);
}