package com.voyageconnect.repository;

import com.voyageconnect.model.ApiReservation;
import com.voyageconnect.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApiReservationRepository extends JpaRepository<ApiReservation, Long> {
    
    @Query("SELECT r FROM ApiReservation r WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<ApiReservation> findByUserId(Long userId);
    
    @Query("SELECT r FROM ApiReservation r ORDER BY r.createdAt DESC")
    List<ApiReservation> findAllOrderByCreatedAtDesc();
    
    @Query("SELECT r FROM ApiReservation r WHERE r.status = :status ORDER BY r.createdAt DESC")
    List<ApiReservation> findByStatus(ReservationStatus status);
    
    @Query("SELECT COUNT(r) FROM ApiReservation r WHERE r.user.id = :userId")
    long countByUserId(Long userId);
}
