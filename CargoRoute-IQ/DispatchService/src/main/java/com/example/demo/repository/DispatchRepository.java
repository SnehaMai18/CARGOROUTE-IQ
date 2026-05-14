package com.example.demo.repository;


import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.entities.Dispatch;
import com.example.demo.entities.enums.DispatchStatus;

@Repository
public interface DispatchRepository extends JpaRepository<Dispatch,Long>{ 
	 
	 Dispatch findByLoadID(Long loadID);
	 
	 List<Dispatch> findByAssignedBy(String assignedBy);
	 
	 List<Dispatch> findByStatus(DispatchStatus status);
}
