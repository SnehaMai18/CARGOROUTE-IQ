package com.example.demo.repository;


import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.ProofOfDelivery;
import com.example.demo.entities.enums.PodType;
import com.example.demo.entities.enums.ProofOfDeliveryStatus; 

@Repository
public interface ProofOfDeliveryRepository extends JpaRepository<ProofOfDelivery,Long>{
	
	ProofOfDelivery findByBookingID(Long bookingID);
	List<ProofOfDelivery> findByPodType(PodType type);
	List<ProofOfDelivery> findByStatus(ProofOfDeliveryStatus status);
	List<ProofOfDelivery> findByDriverId(Long driverId);
	
} 
