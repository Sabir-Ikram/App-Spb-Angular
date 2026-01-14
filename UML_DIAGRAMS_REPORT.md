# VoyageConnect - UML Diagrams & System Design Report

## Project Overview

**VoyageConnect** is a comprehensive travel booking platform that allows users to search and book flights and hotels through integration with external APIs (Amadeus for flights, Booking.com for hotels). The system includes user authentication, payment processing via Stripe, and an admin dashboard for managing all reservations.

### Key Technologies
- **Backend**: Spring Boot 3.x, Spring Security, Spring Data JPA, MySQL
- **Frontend**: Angular 16+ with Material Design
- **External APIs**: Amadeus API, Booking.com API (RapidAPI), Stripe Payment Gateway
- **Authentication**: JWT (JSON Web Tokens)

---

## 1. Use Case Diagram

### Description
The use case diagram illustrates the main functionalities of the VoyageConnect system and the actors who interact with it. The system has three main actors:
- **Guest/Visitor**: Unregistered users who can browse destinations
- **Registered User**: Authenticated users who can search and book travel services
- **Administrator**: System admins who manage the platform

### PlantUML Code

```plantuml
@startuml VoyageConnect_UseCase
left to right direction
skinparam packageStyle rectangle

actor "Guest/Visitor" as Guest
actor "Registered User" as User
actor "Administrator" as Admin
actor "Amadeus API" as Amadeus
actor "Booking.com API" as Booking
actor "Stripe Payment" as Stripe

rectangle "VoyageConnect System" {
  ' Guest Use Cases
  usecase "Browse Destinations" as UC1
  usecase "View Flights" as UC2
  usecase "View Hotels" as UC3
  usecase "Register Account" as UC4
  usecase "Login" as UC5
  
  ' User Use Cases
  usecase "Search Flights" as UC6
  usecase "Search Hotels" as UC7
  usecase "View Flight Details" as UC8
  usecase "View Hotel Details" as UC9
  usecase "Create Reservation" as UC10
  usecase "Make Payment" as UC11
  usecase "View My Reservations" as UC12
  usecase "Cancel Reservation" as UC13
  usecase "Update Profile" as UC14
  usecase "Logout" as UC15
  
  ' Admin Use Cases
  usecase "View All Reservations" as UC16
  usecase "Update Reservation Status" as UC17
  usecase "View System Statistics" as UC18
  usecase "Manage Users" as UC19
  usecase "View Payment History" as UC20
  
  ' System Internal Use Cases
  usecase "Fetch Flight Offers" as UC21
  usecase "Fetch Hotel Offers" as UC22
  usecase "Process Payment" as UC23
  usecase "Generate JWT Token" as UC24
  usecase "Validate Token" as UC25
}

' Guest relationships
Guest --> UC1
Guest --> UC2
Guest --> UC3
Guest --> UC4
Guest --> UC5

' User relationships
User --> UC6
User --> UC7
User --> UC8
User --> UC9
User --> UC10
User --> UC11
User --> UC12
User --> UC13
User --> UC14
User --> UC15

' User inherits Guest capabilities
User --|> Guest

' Admin relationships
Admin --> UC16
Admin --> UC17
Admin --> UC18
Admin --> UC19
Admin --> UC20

' Admin inherits User capabilities
Admin --|> User

' Include relationships
UC6 ..> UC21 : <<include>>
UC7 ..> UC22 : <<include>>
UC10 ..> UC11 : <<include>>
UC11 ..> UC23 : <<include>>
UC5 ..> UC24 : <<include>>
UC6 ..> UC25 : <<include>>
UC7 ..> UC25 : <<include>>
UC10 ..> UC25 : <<include>>

' Extend relationships
UC13 ..> UC12 : <<extend>>

' External API relationships
UC21 --> Amadeus
UC22 --> Booking
UC23 --> Stripe

@enduml
```

### Use Case Descriptions

| Use Case ID | Name | Actor | Description |
|-------------|------|-------|-------------|
| UC1 | Browse Destinations | Guest | Browse available travel destinations |
| UC2 | View Flights | Guest | View flight listings without booking |
| UC3 | View Hotels | Guest | View hotel listings without booking |
| UC4 | Register Account | Guest | Create a new user account |
| UC5 | Login | Guest/User | Authenticate into the system |
| UC6 | Search Flights | User | Search for available flights using filters |
| UC7 | Search Hotels | User | Search for available hotels using filters |
| UC10 | Create Reservation | User | Book a flight, hotel, or package |
| UC11 | Make Payment | User | Process payment for reservation |
| UC12 | View My Reservations | User | View personal booking history |
| UC13 | Cancel Reservation | User | Cancel an existing reservation |
| UC16 | View All Reservations | Admin | View all system reservations |
| UC17 | Update Reservation Status | Admin | Modify reservation status |

---

## 2. Class Diagram

### Description
The class diagram shows the structure of the VoyageConnect system, including all domain entities, their attributes, relationships, and cardinalities. The system follows a layered architecture with clear separation between entities, services, controllers, and repositories.

### PlantUML Code

```plantuml
@startuml VoyageConnect_ClassDiagram
skinparam classAttributeIconSize 0
skinparam linetype ortho

' ============================================
' DOMAIN ENTITIES
' ============================================

class User {
  - id: Long
  - fullName: String
  - email: String
  - password: String
  - role: Role
  --
  + getReservations(): List<ApiReservation>
}

enum Role {
  USER
  ADMIN
}

class Destination {
  - id: Long
  - country: String
  - city: String
  - description: String
  --
  + getFlights(): List<Flight>
  + getHotels(): List<Hotel>
}

class Flight {
  - id: Long
  - departure: LocalDateTime
  - arrival: LocalDateTime
  - price: BigDecimal
  - availableSeats: Integer
  - airline: String
  - flightNumber: String
  - imageUrl: String
  --
  + getDestination(): Destination
}

class Hotel {
  - id: Long
  - name: String
  - pricePerNight: BigDecimal
  - availableRooms: Integer
  - address: String
  - rating: Integer
  - imageUrl: String
  - description: String
  - provider: String
  --
  + getDestination(): Destination
}

class ApiReservation {
  - id: Long
  - type: ReservationType
  - status: ReservationStatus
  - totalPrice: BigDecimal
  - createdAt: LocalDateTime
  --
  + getUser(): User
  + getFlightDetails(): ReservationFlight
  + getHotelDetails(): ReservationHotel
}

enum ReservationType {
  FLIGHT
  HOTEL
  PACKAGE
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

class ReservationFlight {
  - id: Long
  - flightNumber: String
  - airline: String
  - departureDate: LocalDateTime
  - arrivalDate: LocalDateTime
  - origin: String
  - destination: String
  - passengers: Integer
  - price: BigDecimal
  --
  + getReservation(): ApiReservation
}

class ReservationHotel {
  - id: Long
  - hotelName: String
  - checkInDate: LocalDate
  - checkOutDate: LocalDate
  - city: String
  - roomCount: Integer
  - nights: Integer
  - pricePerNight: BigDecimal
  - totalPrice: BigDecimal
  --
  + getReservation(): ApiReservation
}

class Payment {
  - id: Long
  - amount: BigDecimal
  - method: PaymentMethod
  - status: PaymentStatus
  - stripePaymentIntentId: String
  - stripeClientSecret: String
  - failureReason: String
  - createdAt: LocalDateTime
  - updatedAt: LocalDateTime
  --
  + getReservation(): ApiReservation
}

enum PaymentMethod {
  CREDIT_CARD
  DEBIT_CARD
  STRIPE
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  CANCELLED
}

' ============================================
' CONTROLLERS (REST API)
' ============================================

class AuthController {
  - authenticationManager: AuthenticationManager
  - jwtUtil: JwtUtil
  - userRepository: UserRepository
  - passwordEncoder: PasswordEncoder
  --
  + login(request: AuthRequest): AuthResponse
  + register(request: RegisterRequest): ResponseEntity
}

class ApiReservationController {
  - reservationService: ApiReservationService
  --
  + createReservation(request: CreateApiReservationRequest): ResponseEntity
  + getUserReservations(): List<ApiReservationResponse>
  + getReservation(id: Long): ApiReservationResponse
  + getAllReservations(): List<ApiReservationResponse>
  + updateReservationStatus(id: Long, status: String): ResponseEntity
}

class PaymentController {
  - paymentService: PaymentService
  - reservationRepository: ApiReservationRepository
  --
  + createPaymentIntent(reservationId: Long): PaymentIntentResponse
  + confirmPayment(paymentIntentId: String): ResponseEntity
  + getPaymentStatus(reservationId: Long): ResponseEntity
}

class FlightController {
  - flightService: FlightService
  --
  + searchFlights(origin: String, destination: String, ...): List<FlightDTO>
  + getFlightDetails(id: Long): FlightDTO
}

class HotelController {
  - hotelService: HotelService
  --
  + searchHotels(city: String, checkIn: String, ...): List<HotelDTO>
  + getHotelDetails(id: Long): HotelDTO
}

class DestinationController {
  - destinationService: DestinationService
  --
  + getAllDestinations(): List<DestinationDTO>
  + searchDestinations(query: String): List<DestinationDTO>
  + getDestination(id: Long): DestinationDTO
}

class AdminController {
  - adminService: AdminService
  --
  + getStatistics(): StatisticsDTO
  + getAllUsers(): List<UserDTO>
  + deleteUser(id: Long): ResponseEntity
}

' ============================================
' SERVICES (BUSINESS LOGIC)
' ============================================

class ApiReservationService {
  - reservationRepository: ApiReservationRepository
  - userRepository: UserRepository
  - paymentService: PaymentService
  --
  + createReservation(request: CreateApiReservationRequest): ApiReservationResponse
  + getUserReservations(): List<ApiReservationResponse>
  + getReservation(id: Long): ApiReservationResponse
  + updateReservationStatus(id: Long, status: ReservationStatus): ApiReservation
}

class PaymentService {
  - paymentRepository: PaymentRepository
  - stripeClient: Stripe
  --
  + createPaymentIntent(reservation: ApiReservation): PaymentIntentResponse
  + confirmPayment(paymentIntentId: String): Payment
  + getPaymentByReservationId(reservationId: Long): Payment
}

class FlightService {
  - flightRepository: FlightRepository
  - amadeusClient: AmadeusClient
  --
  + searchFlights(criteria: FlightSearchCriteria): List<Flight>
  + getFlightOffers(origin: String, destination: String): List<FlightDTO>
}

class HotelService {
  - hotelRepository: HotelRepository
  - bookingApiClient: BookingApiClient
  --
  + searchHotels(criteria: HotelSearchCriteria): List<Hotel>
  + getHotelOffers(city: String, dates: String[]): List<HotelDTO>
}

class DestinationService {
  - destinationRepository: DestinationRepository
  - imageService: ImageService
  --
  + search(query: String): List<Destination>
  + getAll(): List<Destination>
  + getById(id: Long): Destination
}

class CustomUserDetailsService {
  - userRepository: UserRepository
  --
  + loadUserByUsername(email: String): UserDetails
}

' ============================================
' SECURITY COMPONENTS
' ============================================

class JwtUtil {
  - secret: String
  - expirationMs: Long
  --
  + generateToken(username: String, role: String): String
  + extractUsername(token: String): String
  + validateToken(token: String): Boolean
}

class JwtAuthenticationFilter {
  - jwtUtil: JwtUtil
  - userDetailsService: CustomUserDetailsService
  --
  + doFilterInternal(request, response, filterChain): void
}

class SecurityConfig {
  --
  + securityFilterChain(http: HttpSecurity): SecurityFilterChain
  + authenticationManager(): AuthenticationManager
  + passwordEncoder(): PasswordEncoder
}

' ============================================
' EXTERNAL API CLIENTS
' ============================================

class AmadeusClient {
  - apiKey: String
  - apiSecret: String
  - restTemplate: RestTemplate
  --
  + authenticate(): String
  + searchFlights(params: Map): FlightOffersResponse
  + searchDestinations(keyword: String): LocationResponse
}

class BookingApiClient {
  - apiKey: String
  - apiHost: String
  - restTemplate: RestTemplate
  --
  + searchHotels(params: Map): HotelSearchResponse
  + getHotelDetails(hotelId: String): HotelDetailsResponse
}

class StripeClient {
  - secretKey: String
  --
  + createPaymentIntent(amount: BigDecimal, currency: String): PaymentIntent
  + confirmPaymentIntent(paymentIntentId: String): PaymentIntent
}

' ============================================
' REPOSITORIES (DATA ACCESS)
' ============================================

interface UserRepository {
  + findByEmail(email: String): Optional<User>
  + existsByEmail(email: String): Boolean
}

interface ApiReservationRepository {
  + findByUserId(userId: Long): List<ApiReservation>
  + findByStatus(status: ReservationStatus): List<ApiReservation>
}

interface PaymentRepository {
  + findByReservationId(reservationId: Long): Optional<Payment>
  + findByStripePaymentIntentId(intentId: String): Optional<Payment>
}

interface FlightRepository {
  + findByDestinationId(destId: Long): List<Flight>
  + findByAirline(airline: String): List<Flight>
}

interface HotelRepository {
  + findByDestinationId(destId: Long): List<Hotel>
  + findByRatingGreaterThan(rating: Integer): List<Hotel>
}

interface DestinationRepository {
  + findByCityContainingIgnoreCase(city: String): List<Destination>
  + findByCountry(country: String): List<Destination>
}

' ============================================
' RELATIONSHIPS
' ============================================

' Entity Relationships
User "1" --> "0..*" ApiReservation : has >
User --> Role : has >

Destination "1" --> "0..*" Flight : offers >
Destination "1" --> "0..*" Hotel : offers >

ApiReservation --> ReservationType : has >
ApiReservation --> ReservationStatus : has >
ApiReservation "1" --> "0..1" ReservationFlight : contains >
ApiReservation "1" --> "0..1" ReservationHotel : contains >
ApiReservation "1" <-- "0..1" Payment : pays for >

Payment --> PaymentMethod : uses >
Payment --> PaymentStatus : has >

' Controller-Service Dependencies
AuthController --> CustomUserDetailsService
AuthController --> JwtUtil
ApiReservationController --> ApiReservationService
PaymentController --> PaymentService
FlightController --> FlightService
HotelController --> HotelService
DestinationController --> DestinationService
AdminController --> ApiReservationService

' Service-Repository Dependencies
ApiReservationService --> ApiReservationRepository
ApiReservationService --> UserRepository
PaymentService --> PaymentRepository
FlightService --> FlightRepository
HotelService --> HotelRepository
DestinationService --> DestinationRepository
CustomUserDetailsService --> UserRepository

' Service-External API Dependencies
FlightService --> AmadeusClient
HotelService --> BookingApiClient
PaymentService --> StripeClient

' Security Dependencies
JwtAuthenticationFilter --> JwtUtil
JwtAuthenticationFilter --> CustomUserDetailsService
SecurityConfig --> JwtAuthenticationFilter

@enduml
```

### Key Design Patterns
- **Repository Pattern**: Data access abstraction through Spring Data JPA
- **Service Layer Pattern**: Business logic separation
- **DTO Pattern**: Data transfer between layers
- **Factory Pattern**: Object creation for reservations
- **Strategy Pattern**: Different payment methods
- **Singleton Pattern**: Spring Bean management

---

## 3. Sequence Diagrams

### 3.1 User Registration & Login Sequence

```plantuml
@startuml Registration_Login_Sequence
autonumber
actor User
participant "Angular Frontend" as Frontend
participant "AuthController" as AuthCtrl
participant "UserRepository" as UserRepo
participant "PasswordEncoder" as Encoder
participant "JwtUtil" as JWT
participant "AuthenticationManager" as AuthMgr
database "MySQL Database" as DB

== User Registration ==
User -> Frontend: Enter registration details
Frontend -> AuthCtrl: POST /api/auth/register
AuthCtrl -> UserRepo: findByEmail(email)
UserRepo -> DB: SELECT * FROM users WHERE email=?
DB --> UserRepo: null (email not exists)
UserRepo --> AuthCtrl: Optional.empty()
AuthCtrl -> Encoder: encode(password)
Encoder --> AuthCtrl: encodedPassword
AuthCtrl -> UserRepo: save(newUser)
UserRepo -> DB: INSERT INTO users
DB --> UserRepo: User entity with ID
UserRepo --> AuthCtrl: savedUser
AuthCtrl --> Frontend: 201 Created
Frontend --> User: Registration successful

== User Login ==
User -> Frontend: Enter email & password
Frontend -> AuthCtrl: POST /api/auth/login
AuthCtrl -> AuthMgr: authenticate(email, password)
AuthMgr -> UserRepo: findByEmail(email)
UserRepo -> DB: SELECT * FROM users WHERE email=?
DB --> UserRepo: User entity
UserRepo --> AuthMgr: UserDetails
AuthMgr -> Encoder: matches(rawPassword, encodedPassword)
Encoder --> AuthMgr: true
AuthMgr --> AuthCtrl: Authentication object
AuthCtrl -> JWT: generateToken(email, role)
JWT --> AuthCtrl: JWT token
AuthCtrl --> Frontend: 200 OK {token, tokenType}
Frontend -> Frontend: Store token in localStorage
Frontend --> User: Login successful, redirect to home

@enduml
```

### 3.2 Flight Search & Booking Sequence

```plantuml
@startuml Flight_Search_Booking_Sequence
autonumber
actor User
participant "Angular Frontend" as Frontend
participant "JwtAuthFilter" as JWTFilter
participant "FlightController" as FlightCtrl
participant "FlightService" as FlightSvc
participant "AmadeusClient" as Amadeus
participant "ReservationController" as ResvCtrl
participant "ReservationService" as ResvSvc
participant "PaymentController" as PayCtrl
participant "PaymentService" as PaySvc
participant "StripeClient" as Stripe
database "MySQL Database" as DB

== Flight Search ==
User -> Frontend: Enter search criteria\n(origin, destination, dates)
Frontend -> JWTFilter: GET /api/flights/search\n+ JWT token in header
JWTFilter -> JWTFilter: Validate JWT token
JWTFilter -> FlightCtrl: Forward request
FlightCtrl -> FlightSvc: searchFlights(criteria)
FlightSvc -> Amadeus: POST /v2/shopping/flight-offers
Amadeus --> FlightSvc: Flight offers JSON
FlightSvc -> FlightSvc: Map to FlightDTO
FlightSvc --> FlightCtrl: List<FlightDTO>
FlightCtrl --> Frontend: 200 OK + flight list
Frontend --> User: Display available flights

== Flight Booking ==
User -> Frontend: Select flight & click "Book"
Frontend -> ResvCtrl: POST /api/reservations\n{type: FLIGHT, flight: {...}}
ResvCtrl -> ResvSvc: createReservation(request)
ResvSvc -> ResvSvc: Extract authenticated user email
ResvSvc -> DB: Find user by email
DB --> ResvSvc: User entity
ResvSvc -> ResvSvc: Create ApiReservation entity
ResvSvc -> ResvSvc: Create ReservationFlight entity
ResvSvc -> DB: Save reservation + flight details
DB --> ResvSvc: Saved reservation with ID
ResvSvc --> ResvCtrl: ApiReservationResponse
ResvCtrl --> Frontend: 201 Created {reservationId, ...}
Frontend --> User: Reservation created, redirect to payment

== Payment Processing ==
User -> Frontend: Click "Pay Now"
Frontend -> PayCtrl: POST /api/payments/create-payment-intent/{reservationId}
PayCtrl -> PayCtrl: Verify user owns reservation
PayCtrl -> PaySvc: createPaymentIntent(reservation)
PaySvc -> Stripe: Create PaymentIntent\n(amount, currency)
Stripe --> PaySvc: PaymentIntent {clientSecret, id}
PaySvc -> PaySvc: Create Payment entity
PaySvc -> DB: Save payment record
DB --> PaySvc: Saved payment
PaySvc --> PayCtrl: PaymentIntentResponse
PayCtrl --> Frontend: 200 OK {clientSecret}
Frontend -> Frontend: Load Stripe.js & confirm payment
Frontend -> Stripe: Confirm card payment
Stripe --> Frontend: Payment succeeded
Frontend -> PayCtrl: POST /api/payments/confirm/{paymentIntentId}
PayCtrl -> PaySvc: confirmPayment(intentId)
PaySvc -> DB: Update payment status = SUCCEEDED
PaySvc -> DB: Update reservation status = CONFIRMED
DB --> PaySvc: Success
PaySvc --> PayCtrl: Payment confirmed
PayCtrl --> Frontend: 200 OK
Frontend --> User: Payment successful!\nBooking confirmed

@enduml
```

### 3.3 Hotel Search & Booking Sequence

```plantuml
@startuml Hotel_Search_Booking_Sequence
autonumber
actor User
participant "Angular Frontend" as Frontend
participant "HotelController" as HotelCtrl
participant "HotelService" as HotelSvc
participant "BookingApiClient" as BookingAPI
participant "ReservationService" as ResvSvc
participant "PaymentService" as PaySvc
database "MySQL Database" as DB

== Hotel Search ==
User -> Frontend: Enter hotel search\n(city, dates, guests)
Frontend -> HotelCtrl: GET /api/hotels/search?city={city}&limit=20
HotelCtrl -> HotelSvc: searchHotels(city, limit)
HotelSvc -> BookingAPI: GET /locations/search?name={city}
BookingAPI --> HotelSvc: Location destination_id
HotelSvc -> BookingAPI: GET /properties/list?dest_id={id}
BookingAPI --> HotelSvc: Hotel list JSON
HotelSvc -> HotelSvc: Map to HotelDTO\n(extract name, price, rating)
HotelSvc --> HotelCtrl: List<HotelDTO>
HotelCtrl --> Frontend: 200 OK + hotel list
Frontend --> User: Display hotels with images

== Hotel Booking ==
User -> Frontend: Select hotel & click "Reserve"
Frontend -> ResvSvc: POST /api/reservations\n{type: HOTEL, hotel: {...}}
ResvSvc -> ResvSvc: Validate user authentication
ResvSvc -> ResvSvc: Create ApiReservation\n(status: PENDING)
ResvSvc -> ResvSvc: Create ReservationHotel\n(dates, rooms, nights)
ResvSvc -> ResvSvc: Calculate total price\n(pricePerNight * nights)
ResvSvc -> DB: Save reservation + hotel details
DB --> ResvSvc: Saved with ID
ResvSvc --> Frontend: 201 Created {reservationId}
Frontend --> User: Redirect to payment

== Payment & Confirmation ==
User -> Frontend: Complete payment form
Frontend -> PaySvc: Create & confirm payment
PaySvc -> DB: Update payment status
PaySvc -> DB: Update reservation status = CONFIRMED
DB --> PaySvc: Success
PaySvc --> Frontend: Payment confirmed
Frontend --> User: Hotel booking confirmed!\nConfirmation email sent

@enduml
```

### 3.4 Admin Reservation Management Sequence

```plantuml
@startuml Admin_Management_Sequence
autonumber
actor Admin
participant "Angular Frontend" as Frontend
participant "JwtAuthFilter" as JWTFilter
participant "AdminController" as AdminCtrl
participant "ReservationController" as ResvCtrl
participant "ReservationService" as ResvSvc
database "MySQL Database" as DB

== View All Reservations ==
Admin -> Frontend: Navigate to Admin Dashboard
Frontend -> JWTFilter: GET /api/reservations/admin/all\n+ JWT token (ROLE_ADMIN)
JWTFilter -> JWTFilter: Validate token
JWTFilter -> JWTFilter: Check hasRole('ADMIN')
JWTFilter -> ResvCtrl: Forward request
ResvCtrl -> ResvSvc: getAllReservations()
ResvSvc -> DB: SELECT * FROM api_reservations\nLEFT JOIN users\nLEFT JOIN payments
DB --> ResvSvc: All reservation records
ResvSvc -> ResvSvc: Map to ApiReservationResponse\n(include user & payment info)
ResvSvc --> ResvCtrl: List<ApiReservationResponse>
ResvCtrl --> Frontend: 200 OK + all reservations
Frontend --> Admin: Display reservation table\n(filter, sort, search)

== Update Reservation Status ==
Admin -> Frontend: Click "Update Status" on reservation
Frontend -> Frontend: Show status dropdown\n(PENDING, CONFIRMED, CANCELLED)
Admin -> Frontend: Select new status
Frontend -> ResvCtrl: PUT /api/reservations/admin/{id}/status\n{status: "CONFIRMED"}
ResvCtrl -> ResvSvc: updateReservationStatus(id, status)
ResvSvc -> DB: SELECT * FROM api_reservations\nWHERE id = ?
DB --> ResvSvc: ApiReservation entity
ResvSvc -> ResvSvc: reservation.setStatus(newStatus)
ResvSvc -> DB: UPDATE api_reservations\nSET status = ?
DB --> ResvSvc: Success
ResvSvc --> ResvCtrl: Updated reservation
ResvCtrl --> Frontend: 200 OK
Frontend --> Admin: Status updated successfully

== View Statistics ==
Admin -> Frontend: Click "Statistics"
Frontend -> AdminCtrl: GET /api/admin/statistics
AdminCtrl -> DB: COUNT reservations by status
AdminCtrl -> DB: SUM total revenue
AdminCtrl -> DB: COUNT active users
DB --> AdminCtrl: Statistics data
AdminCtrl --> Frontend: 200 OK + stats
Frontend --> Admin: Display charts & metrics

@enduml
```

---

## 4. Activity Diagrams

### 4.1 Complete Booking Process Activity Diagram

```plantuml
@startuml Complete_Booking_Activity
|User|
start
:Open VoyageConnect app;

if (User logged in?) then (no)
  :Navigate to Login/Register;
  :Enter credentials;
  :Submit form;
  
  |System|
  :Validate credentials;
  :Generate JWT token;
  :Return token to client;
  
  |User|
  :Store token in localStorage;
else (yes)
endif

:Choose search type;

if (Search type?) then (Flight)
  |User|
  :Enter flight search\n(origin, destination, dates);
  :Click "Search Flights";
  
  |System|
  :Call Amadeus API;
  :Fetch flight offers;
  :Map to Flight DTOs;
  :Return flight list;
  
  |User|
  :Browse flight results;
  :Select preferred flight;
  :Click "Book Now";
  
  |System|
  :Create ApiReservation\n(type: FLIGHT);
  :Create ReservationFlight details;
  :Save to database;
  
else (Hotel)
  |User|
  :Enter hotel search\n(city, dates, guests);
  :Click "Search Hotels";
  
  |System|
  :Call Booking.com API;
  :Fetch hotel offers;
  :Map to Hotel DTOs;
  :Return hotel list;
  
  |User|
  :Browse hotel results;
  :Select preferred hotel;
  :Click "Reserve Now";
  
  |System|
  :Create ApiReservation\n(type: HOTEL);
  :Create ReservationHotel details;
  :Calculate total price\n(pricePerNight * nights);
  :Save to database;
endif

|System|
:Generate reservation ID;
:Return reservation details;

|User|
:Review booking summary;
:Proceed to payment;

|System|
:Create Stripe PaymentIntent;
:Generate client secret;
:Return payment details;

|User|
:Enter payment details\n(card number, CVV, expiry);
:Click "Pay Now";

|System|
:Process payment via Stripe;

if (Payment successful?) then (yes)
  :Update payment status = SUCCEEDED;
  :Update reservation status = CONFIRMED;
  :Send confirmation email;
  
  |User|
  :Display success message;
  :View booking confirmation;
  stop
else (no)
  :Update payment status = FAILED;
  :Log failure reason;
  
  |User|
  :Display error message;
  :Retry or cancel;
  stop
endif

@enduml
```

### 4.2 Admin Reservation Management Activity Diagram

```plantuml
@startuml Admin_Management_Activity
|Admin|
start
:Login with admin credentials;

|System|
:Validate admin role;
:Generate JWT with ROLE_ADMIN;

|Admin|
:Access Admin Dashboard;

repeat
  :View reservations list;
  
  if (Action?) then (View Details)
    :Click on reservation;
    
    |System|
    :Fetch reservation details;
    :Include flight/hotel info;
    :Include payment status;
    :Include user information;
    
    |Admin|
    :Review complete details;
    
  else if (Update Status)
    :Select reservation;
    :Choose new status;
    :Submit update;
    
    |System|
    :Validate admin permissions;
    :Update reservation status;
    :Save to database;
    :Log status change;
    
    |Admin|
    :View confirmation;
    
  else if (Search/Filter)
    :Enter search criteria\n(status, date, user);
    
    |System|
    :Apply filters to query;
    :Return filtered results;
    
    |Admin|
    :Review filtered list;
    
  else if (View Statistics)
    :Navigate to statistics;
    
    |System|
    :Calculate metrics;
    :Count reservations by status;
    :Sum total revenue;
    :Count active users;
    :Generate charts;
    
    |Admin|
    :Analyze data;
    
  else (Export Data)
    :Click export button;
    
    |System|
    :Generate CSV/PDF report;
    :Download file;
    
    |Admin|
    :Save report locally;
  endif

repeat while (Continue managing?) is (yes)
->no;

:Logout;
stop

@enduml
```

### 4.3 Payment Processing Activity Diagram

```plantuml
@startuml Payment_Processing_Activity
|User|
start
:Complete reservation form;
:Click "Proceed to Payment";

|Frontend|
:Validate reservation data;
:Send create reservation request;

|Backend|
:Create ApiReservation entity;
:Set status = PENDING;
:Save to database;
:Return reservation ID;

|Frontend|
:Navigate to payment page;
:Display order summary;

|User|
:Review booking details;
:Click "Pay Now";

|Frontend|
:Request payment intent;

|Backend|
:Validate user owns reservation;
:Calculate payment amount;

|Payment Service|
:Create Stripe PaymentIntent;
:Set amount and currency;

|Stripe API|
:Generate client secret;
:Return PaymentIntent object;

|Payment Service|
:Create Payment entity;
:Set status = PENDING;
:Store Stripe IDs;
:Save to database;
:Return client secret;

|Frontend|
:Load Stripe.js library;
:Initialize Stripe Elements;
:Display payment form;

|User|
:Enter card details\n(number, CVV, expiry);
:Click "Submit Payment";

|Frontend|
:Validate card format;
:Call stripe.confirmCardPayment();

|Stripe API|
:Process payment;
:Verify card;
:Check funds;

if (Payment authorized?) then (yes)
  |Stripe API|
  :Charge card;
  :Return success status;
  
  |Frontend|
  :Send payment confirmation;
  
  |Backend|
  :Update payment status = SUCCEEDED;
  :Update reservation status = CONFIRMED;
  :Commit transaction;
  :Trigger confirmation email;
  
  |Frontend|
  :Display success message;
  :Show booking confirmation;
  
  |User|
  :Receive confirmation email;
  :View booking in "My Reservations";
  stop
  
else (no)
  |Stripe API|
  :Return error details\n(insufficient funds, invalid card, etc.);
  
  |Frontend|
  :Send payment failure;
  
  |Backend|
  :Update payment status = FAILED;
  :Store failure reason;
  :Keep reservation status = PENDING;
  :Save to database;
  
  |Frontend|
  :Display error message;
  :Show retry option;
  
  if (User wants to retry?) then (yes)
    |User|
    :Update payment method;
    :Click "Retry Payment";
    
    |Frontend|
    backward:Request new payment intent;
    
  else (no)
    |User|
    :Cancel reservation;
    
    |Backend|
    :Update reservation status = CANCELLED;
    :Release inventory;
    
    stop
  endif
endif

@enduml
```

### 4.4 User Authentication Flow Activity Diagram

```plantuml
@startuml Authentication_Activity
|User|
start
:Access protected page;

|Frontend|
if (JWT token exists?) then (yes)
  :Extract token from localStorage;
  :Add token to request header;
  
  |Backend (JwtAuthFilter)|
  :Extract token from header;
  :Validate token signature;
  
  if (Token valid?) then (yes)
    :Extract username from token;
    :Load user from database;
    :Set authentication context;
    :Allow request to proceed;
    
    |Controller|
    :Process business logic;
    :Return response;
    
    |Frontend|
    :Display protected content;
    stop
    
  else (no - expired/invalid)
    :Return 401 Unauthorized;
    
    |Frontend|
    :Clear invalid token;
    :Redirect to login page;
  endif
  
else (no)
  :Redirect to login page;
endif

|User|
:Enter email and password;
:Click "Login";

|Frontend|
:Validate form fields;
:Send POST /api/auth/login;

|Backend (AuthController)|
:Receive login request;

|AuthenticationManager|
:Load user by email;
:Compare passwords;

if (Credentials valid?) then (yes)
  |JwtUtil|
  :Generate JWT token;
  :Set expiration (24 hours);
  :Sign with secret key;
  
  |AuthController|
  :Return token in response;
  
  |Frontend|
  :Store token in localStorage;
  :Set up HTTP interceptor;
  :Redirect to home page;
  
  |User|
  :Access protected features;
  stop
  
else (no)
  |AuthController|
  :Return 401 Unauthorized;
  
  |Frontend|
  :Display error message\n"Invalid credentials";
  
  |User|
  if (Retry?) then (yes)
    :Enter new credentials;
    backward:Submit login form;
  else (no)
    :Exit application;
    stop
  endif
endif

@enduml
```

---

## 5. System Architecture Overview

### 5.1 Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  Angular 16+ (Frontend) - Material Design Components        │
│  - Home Component      - Flight Search     - Hotel Search   │
│  - Booking Component   - Payment Component - Admin Dashboard│
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST + JWT
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                          │
│  Spring Boot REST Controllers                                │
│  - AuthController      - FlightController  - HotelController│
│  - ReservationController - PaymentController - AdminController│
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  Business Logic & Orchestration                              │
│  - ReservationService  - PaymentService    - FlightService  │
│  - HotelService        - UserService       - DestinationService│
└─────────────────────────────────────────────────────────────┘
                    ↕                           ↕
┌─────────────────────────────┐  ┌────────────────────────────┐
│     REPOSITORY LAYER         │  │   EXTERNAL API LAYER       │
│  Spring Data JPA             │  │  - Amadeus API (Flights)   │
│  - UserRepository            │  │  - Booking.com API (Hotels)│
│  - ReservationRepository     │  │  - Stripe API (Payments)   │
│  - PaymentRepository         │  └────────────────────────────┘
└─────────────────────────────┘
                ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                │
│  MySQL 8.0 Database                                          │
│  Tables: users, api_reservations, payments, flights, hotels  │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Key Technologies Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Angular 16+, TypeScript | SPA framework for user interface |
| UI Components | Angular Material | Pre-built Material Design components |
| State Management | RxJS | Reactive programming & async handling |
| Backend Framework | Spring Boot 3.x | RESTful API development |
| Security | Spring Security + JWT | Authentication & authorization |
| ORM | Spring Data JPA / Hibernate | Object-relational mapping |
| Database | MySQL 8.0 | Relational data storage |
| External APIs | Amadeus, Booking.com, Stripe | Flight, hotel, payment services |
| Build Tools | Maven (Backend), npm (Frontend) | Dependency & build management |

### 5.3 Database Schema Overview

**Main Tables:**
- `users` - User accounts (id, fullName, email, password, role)
- `api_reservations` - Booking records (id, userId, type, status, totalPrice, createdAt)
- `reservation_flights` - Flight details (id, reservationId, flightNumber, airline, dates, price)
- `reservation_hotels` - Hotel details (id, reservationId, hotelName, checkIn, checkOut, price)
- `payments` - Payment transactions (id, reservationId, amount, status, stripePaymentIntentId)
- `destinations` - Travel destinations (id, country, city, description)
- `flights` - Flight inventory (id, destinationId, airline, departure, arrival, price)
- `hotels` - Hotel inventory (id, destinationId, name, pricePerNight, rating)

**Key Relationships:**
- User (1) → (N) ApiReservation
- ApiReservation (1) → (0..1) ReservationFlight
- ApiReservation (1) → (0..1) ReservationHotel
- ApiReservation (1) → (0..1) Payment
- Destination (1) → (N) Flight
- Destination (1) → (N) Hotel

---

## 6. Security Architecture

### Authentication Flow
1. User submits credentials to `/api/auth/login`
2. `AuthenticationManager` validates credentials against database
3. On success, `JwtUtil` generates signed JWT token (24hr expiration)
4. Token returned to client, stored in localStorage
5. Client includes token in `Authorization: Bearer {token}` header for all requests
6. `JwtAuthenticationFilter` intercepts requests, validates tokens
7. Valid tokens grant access to protected endpoints

### Authorization
- **Role-Based Access Control (RBAC)**
  - `ROLE_USER` - Standard users (search, book, view own reservations)
  - `ROLE_ADMIN` - Administrators (all user capabilities + admin dashboard)
- Protected endpoints use `@PreAuthorize("hasRole('ADMIN')")`
- JWT contains role claim for authorization decisions

---

## 7. API Integration Architecture

### Amadeus API (Flight Search)
- **Authentication**: OAuth 2.0 Client Credentials
- **Endpoints Used**:
  - `/v1/security/oauth2/token` - Get access token
  - `/v2/shopping/flight-offers` - Search flights
  - `/v1/reference-data/locations` - Search airports/cities
- **Rate Limits**: 10 requests/second (test), 40 req/s (production)

### Booking.com API (Hotel Search)
- **Authentication**: RapidAPI Key Header
- **Endpoints Used**:
  - `/locations/search` - Get destination ID
  - `/properties/list` - List hotels
  - `/properties/get-details` - Hotel details
- **Provider**: RapidAPI (apidojo-booking-v1)

### Stripe API (Payments)
- **Authentication**: Secret Key (server-side)
- **Flow**: PaymentIntent API
  1. Backend creates PaymentIntent with amount
  2. Frontend receives client secret
  3. Stripe.js confirms payment on client
  4. Webhook confirms status on backend
- **Payment Methods**: Credit/Debit cards

---

## 8. How to Generate Diagrams

### Using PlantUML

1. **Online Editor** (Easiest)
   - Visit: http://www.plantuml.com/plantuml/uml/
   - Copy any PlantUML code from above
   - Paste and view diagram instantly

2. **VS Code Extension**
   - Install: "PlantUML" extension by jebbs
   - Create `.puml` file with diagram code
   - Press `Alt+D` to preview

3. **Command Line**
   ```bash
   # Install PlantUML
   brew install plantuml  # macOS
   # or
   sudo apt install plantuml  # Linux
   
   # Generate diagram
   plantuml diagram.puml
   ```

4. **IntelliJ IDEA Plugin**
   - Install "PlantUML Integration" plugin
   - Right-click `.puml` file → Show Diagram

### Exporting Formats
- **PNG**: Best for reports/presentations
- **SVG**: Scalable vector graphics
- **PDF**: Professional documentation
- **ASCII**: Text-based diagrams

---

## 9. Conclusion

This documentation provides a comprehensive view of the VoyageConnect system architecture through standardized UML diagrams. The diagrams illustrate:

- **Use Cases**: All user interactions and system capabilities
- **Class Structure**: Complete domain model with relationships
- **Sequence Flows**: Step-by-step interaction patterns
- **Activity Processes**: Business logic and workflows

These diagrams serve as essential documentation for:
- Development teams understanding the system
- New developers onboarding to the project
- Stakeholders reviewing system design
- Academic project reports and presentations
- System maintenance and evolution planning

**Project Status**: ✅ Fully Functional MVP
**Architecture**: Clean, layered, production-ready
**External APIs**: Amadeus, Booking.com, Stripe integrated
**Security**: JWT-based authentication with role-based access control
