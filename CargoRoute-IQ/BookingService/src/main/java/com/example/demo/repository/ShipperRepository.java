package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.Shipper;
import com.example.demo.entity.enums.ShipperStatus;

import java.util.List;


public interface ShipperRepository extends JpaRepository<Shipper,Long>{

    // Find shippers by status
    List<Shipper> findByStatus(ShipperStatus status);


}
