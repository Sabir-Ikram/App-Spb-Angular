package com.voyageconnect.controller;

import com.voyageconnect.dto.ApiReservationResponse;
import com.voyageconnect.dto.CreateApiReservationRequest;
import com.voyageconnect.model.ReservationStatus;
import com.voyageconnect.service.ApiReservationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@Slf4j
public class ApiReservationController {

    private final ApiReservationService reservationService;

    public ApiReservationController(ApiReservationService reservationService) {
        this.reservationService = reservationService;
    }

    /**
     * Create a new reservation (flight, hotel, or both)
     */
    @PostMapping
    public ResponseEntity<ApiReservationResponse> createReservation(
            @RequestBody CreateApiReservationRequest request) {
        try {
            log.info("Creating reservation - Type: {}", request.getType());
            ApiReservationResponse response = reservationService.createReservation(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating reservation", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get current user's reservations
     */
    @GetMapping("/me")
    public ResponseEntity<List<ApiReservationResponse>> getUserReservations() {
        try {
            List<ApiReservationResponse> reservations = reservationService.getUserReservations();
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            log.error("Error getting user reservations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get a specific reservation by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiReservationResponse> getReservation(@PathVariable Long id) {
        try {
            ApiReservationResponse response = reservationService.getReservation(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting reservation", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Admin: Get all reservations
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ApiReservationResponse>> getAllReservations() {
        try {
            List<ApiReservationResponse> reservations = reservationService.getAllReservations();
            return ResponseEntity.ok(reservations);
        } catch (Exception e) {
            log.error("Error getting all reservations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Admin: Update reservation status
     */
    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiReservationResponse> updateReservationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        try {
            String statusStr = statusUpdate.get("status");
            ReservationStatus newStatus = ReservationStatus.valueOf(statusStr);
            
            ApiReservationResponse response = reservationService.updateStatus(id, newStatus);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid status", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error updating reservation status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
