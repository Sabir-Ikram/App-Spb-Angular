package com.voyageconnect.controller;

import com.voyageconnect.dto.PaymentIntentResponse;
import com.voyageconnect.model.ApiReservation;
import com.voyageconnect.model.Payment;
import com.voyageconnect.repository.ApiReservationRepository;
import com.voyageconnect.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final ApiReservationRepository reservationRepository;

    public PaymentController(PaymentService paymentService, ApiReservationRepository reservationRepository) {
        this.paymentService = paymentService;
        this.reservationRepository = reservationRepository;
    }

    /**
     * Create a PaymentIntent for a reservation
     */
    @PostMapping("/create-payment-intent/{reservationId}")
    public ResponseEntity<PaymentIntentResponse> createPaymentIntent(@PathVariable Long reservationId) {
        try {
            log.info("Creating payment intent for reservation {}", reservationId);

            // Verify the reservation belongs to the authenticated user
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            log.info("Authenticated user: {}", email);

            ApiReservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found with ID: " + reservationId));

            log.info("Found reservation {} for user {}", reservation.getId(), reservation.getUser().getEmail());

            if (!reservation.getUser().getEmail().equals(email)) {
                log.warn("User {} tried to access reservation {} belonging to {}", email, reservationId, reservation.getUser().getEmail());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Check if payment already exists
            try {
                Payment existingPayment = paymentService.getPaymentByReservationId(reservationId);
                if (existingPayment != null) {
                    log.info("Found existing payment for reservation {}, returning payment intent {}", reservationId, existingPayment.getStripePaymentIntentId());
                    PaymentIntentResponse response = PaymentIntentResponse.builder()
                            .clientSecret(existingPayment.getStripeClientSecret())
                            .paymentIntentId(existingPayment.getStripePaymentIntentId())
                            .amount(existingPayment.getAmount())
                            .status(existingPayment.getStatus().toString())
                            .build();
                    return ResponseEntity.ok(response);
                }
            } catch (Exception e) {
                // Payment doesn't exist, continue to create new one
                log.info("No existing payment found for reservation {}, will create new one", reservationId);
            }

            Payment payment = paymentService.createPaymentIntent(reservation);
            PaymentIntentResponse response = PaymentIntentResponse.builder()
                    .clientSecret(payment.getStripeClientSecret())
                    .paymentIntentId(payment.getStripePaymentIntentId())
                    .amount(payment.getAmount())
                    .status(payment.getStatus().toString())
                    .build();

            log.info("Successfully created payment intent for reservation {}", reservationId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating payment intent for reservation {}", reservationId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Confirm payment (called by webhook or frontend)
     */
    @PostMapping("/confirm/{paymentIntentId}")
    public ResponseEntity<Void> confirmPayment(@PathVariable String paymentIntentId) {
        try {
            paymentService.confirmPayment(paymentIntentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error confirming payment {}", paymentIntentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Handle payment failure
     */
    @PostMapping("/fail/{paymentIntentId}")
    public ResponseEntity<Void> failPayment(
            @PathVariable String paymentIntentId,
            @RequestParam String reason) {
        try {
            paymentService.failPayment(paymentIntentId, reason);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error failing payment {}", paymentIntentId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get payment details for a reservation
     */
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<PaymentIntentResponse> getPaymentForReservation(@PathVariable Long reservationId) {
        try {
            Payment payment = paymentService.getPaymentByReservationId(reservationId);
            PaymentIntentResponse response = PaymentIntentResponse.builder()
                    .clientSecret(payment.getStripeClientSecret())
                    .paymentIntentId(payment.getStripePaymentIntentId())
                    .amount(payment.getAmount())
                    .status(payment.getStatus().toString())
                    .build();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting payment for reservation {}", reservationId, e);
            return ResponseEntity.notFound().build();
        }
    }
}