package com.example.demo.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.KPI;

public interface KPIRepo extends JpaRepository<KPI, Long> {

    Optional<KPI> findByName(String name);

    List<KPI> findAllByName(String name);
}

 