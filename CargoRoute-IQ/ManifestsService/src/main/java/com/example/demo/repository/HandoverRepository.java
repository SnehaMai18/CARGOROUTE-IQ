package com.example.demo.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.entities.Handover;

@Repository
public interface HandoverRepository extends JpaRepository<Handover, Long> {

    List<Handover> findByManifest_ManifestID(Long manifestID);

    List<Handover> findByHandedBy(String handedBy);
}