package com.example.demo.repository;


import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.entities.Driver;
import com.example.demo.entities.enums.DriverStatus;

@Repository
public interface DriverRepository extends JpaRepository<Driver,Long>{ 
	List<Driver> findByStatus(DriverStatus status);
} 