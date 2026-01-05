package com.voyageconnect.service;

import com.voyageconnect.model.Destination;
import com.voyageconnect.model.Flight;
import com.voyageconnect.repository.DestinationRepository;
import com.voyageconnect.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightImportService {

    private final FlightRepository flightRepository;
    private final DestinationRepository destinationRepository;

    private static final List<String> AIRLINES = List.of(
            "Delta Airlines", "United Airlines", "American Airlines", "Emirates", 
            "Lufthansa", "Air France", "British Airways", "Qatar Airways",
            "Singapore Airlines", "Turkish Airlines", "KLM", "Etihad Airways",
            "Cathay Pacific", "Swiss International", "Japan Airlines", "Korean Air"
    );

    private static final List<String> UNSPLASH_IMAGES = List.of(
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
            "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800",
            "https://images.unsplash.com/photo-1583500557349-fb5238f8d946?w=800",
            "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800",
            "https://images.unsplash.com/photo-1520483601560-4b62a51f2e80?w=800"
    );

    @Transactional
    public List<Flight> importFlights() {
        log.info("Starting flight import for all destinations");
        List<Flight> importedFlights = new ArrayList<>();
        List<Destination> destinations = destinationRepository.findAll();

        if (destinations.isEmpty()) {
            log.warn("No destinations found. Please import destinations first.");
            return importedFlights;
        }

        Random random = new Random();
        int flightNumber = 1000;

        for (Destination destination : destinations) {
            // Create 2-3 flights per destination
            int flightsToCreate = 2 + random.nextInt(2); // 2 or 3 flights

            for (int i = 0; i < flightsToCreate; i++) {
                try {
                    // Random airline
                    String airline = AIRLINES.get(random.nextInt(AIRLINES.size()));
                    
                    // Generate flight number
                    String flightCode = airline.substring(0, 2).toUpperCase() + flightNumber++;
                    
                    // Random departure date (within next 30 days)
                    LocalDateTime departureDate = LocalDateTime.now().plusDays(random.nextInt(30) + 1)
                            .withHour(6 + random.nextInt(18))
                            .withMinute(0)
                            .withSecond(0);
                    
                    // Flight duration based on destination (4-16 hours)
                    int flightDuration = 4 + random.nextInt(12);
                    LocalDateTime arrivalDate = departureDate.plusHours(flightDuration);
                    
                    // Price based on distance/duration (100-1500)
                    BigDecimal basePrice = BigDecimal.valueOf(100 + (flightDuration * 80));
                    BigDecimal priceVariation = BigDecimal.valueOf(-50 + random.nextInt(200));
                    BigDecimal price = basePrice.add(priceVariation);
                    
                    // Available seats
                    int availableSeats = 100 + random.nextInt(150);
                    
                    // Random image
                    String imageUrl = UNSPLASH_IMAGES.get(random.nextInt(UNSPLASH_IMAGES.size()));
                    
                    Flight flight = Flight.builder()
                            .departure(departureDate)
                            .arrival(arrivalDate)
                            .price(price)
                            .availableSeats(availableSeats)
                            .destination(destination)
                            .airline(airline)
                            .flightNumber(flightCode)
                            .imageUrl(imageUrl)
                            .build();

                    flightRepository.save(flight);
                    importedFlights.add(flight);
                    
                    log.info("Created flight: {} to {} - {} ({})", 
                            flightCode, destination.getCity(), airline, price);

                } catch (Exception e) {
                    log.error("Failed to create flight for destination: {}", destination.getCity(), e);
                }
            }
        }

        log.info("Flight import completed. Created {} flights for {} destinations", 
                importedFlights.size(), destinations.size());
        return importedFlights;
    }

    @Transactional
    public void clearAllFlights() {
        log.info("Clearing all flights");
        flightRepository.deleteAll();
    }
}
