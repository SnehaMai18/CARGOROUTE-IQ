package com.example.demo.repository;

import com.example.demo.entity.Claim;
import com.example.demo.entity.enums.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByExceptionRecord_ExceptionID(Long exceptionID);

    List<Claim> findByStatus(ClaimStatus status);

    List<Claim> findByFiledBy(Long filedBy);
}