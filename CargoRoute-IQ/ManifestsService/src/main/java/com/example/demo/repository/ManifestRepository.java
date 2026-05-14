package com.example.demo.repository;


import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.entities.Manifest; 

@Repository
public interface ManifestRepository extends JpaRepository<Manifest,Long>{ 
	
	Manifest findByLoadID(Long loadID);
	
	List<Manifest> findByWarehouseID(Long warehouseID);
} 

