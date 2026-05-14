package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.entities.DriverAck;

@Repository
public interface DriverAckRepository extends JpaRepository<DriverAck, Long> {

    //JPA relationship-based queries
    List<DriverAck> findByDispatch_DispatchID(Long dispatchID);

    List<DriverAck> findByDriver_DriverID(Long driverID);
}
