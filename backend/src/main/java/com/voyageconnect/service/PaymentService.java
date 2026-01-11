package com.voyageconnect.service;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.voyageconnect.model.ApiReservation;
import com.voyageconnect.model.Payment;
import com.voyageconnect.model.PaymentMethod;
import com.voyageconnect.model.PaymentStatus;
import com.voyageconnect.repository.ApiReservationRepository;
import com.voyageconnect.repository.PaymentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ApiReservationRepository reservationRepository;

    public PaymentService(PaymentRepository paymentRepository,
                         ApiReservationRepository reservationRepository,
                         @Value("${stripe.secret-key}") String stripeSecretKey) {
        this.paymentRepository = paymentRepository;
        this.reservationRepository = reservationRepository;
        Stripe.apiKey = stripeSecretKey;
    }

    @Transactional
    public Payment createPaymentIntent(ApiReservation reservation) {
        try {
            log.info("Creating new PaymentIntent for reservation {}", reservation.getId());

            // Create Stripe PaymentIntent
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(reservation.getTotalPrice().multiply(BigDecimal.valueOf(100)).longValue()) // Convert to cents
                    .setCurrency("usd")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .putMetadata("reservationId", reservation.getId().toString())
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            // Create Payment record
            Payment payment = Payment.builder()
                    .reservation(reservation)
                    .amount(reservation.getTotalPrice())
                    .method(PaymentMethod.STRIPE)
                    .status(PaymentStatus.PENDING)
                    .stripePaymentIntentId(paymentIntent.getId())
                    .stripeClientSecret(paymentIntent.getClientSecret())
                    .build();

            payment = paymentRepository.save(payment);

            log.info("Created PaymentIntent for reservation {}: {}", reservation.getId(), paymentIntent.getId());
            return payment;

        } catch (Exception e) {
            log.error("Error creating PaymentIntent for reservation {}", reservation.getId(), e);
            throw new RuntimeException("Failed to create payment intent", e);
        }
    }

    @Transactional
    public void confirmPayment(String paymentIntentId) {
        try {
            Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for PaymentIntent: " + paymentIntentId));

            payment.setStatus(PaymentStatus.COMPLETED);
            paymentRepository.save(payment);

            // Update reservation status
            ApiReservation reservation = payment.getReservation();
            reservation.setStatus(com.voyageconnect.model.ReservationStatus.CONFIRMED);
            reservationRepository.save(reservation);

            log.info("Confirmed payment for reservation {}", reservation.getId());

        } catch (Exception e) {
            log.error("Error confirming payment for PaymentIntent {}", paymentIntentId, e);
            throw new RuntimeException("Failed to confirm payment", e);
        }
    }

    @Transactional
    public void failPayment(String paymentIntentId, String reason) {
        try {
            Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for PaymentIntent: " + paymentIntentId));

            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(reason);
            paymentRepository.save(payment);

            log.info("Failed payment for reservation {}: {}", payment.getReservation().getId(), reason);

        } catch (Exception e) {
            log.error("Error failing payment for PaymentIntent {}", paymentIntentId, e);
            throw new RuntimeException("Failed to update payment status", e);
        }
    }

    public Payment getPaymentByReservationId(Long reservationId) {
        return paymentRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new RuntimeException("Payment not found for reservation: " + reservationId));
    }
}