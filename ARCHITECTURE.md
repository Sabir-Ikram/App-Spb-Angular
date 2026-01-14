# Architecture de l'Application VoyageConnect

## Vue d'ensemble

VoyageConnect est une plateforme de réservation de voyages complète permettant aux utilisateurs de rechercher et réserver des vols, des hôtels et des packages combinés.

### Stack Technologique

- **Frontend**: Angular 16+ (Standalone Components)
- **Backend**: Spring Boot 3.1.2 (Java 21)
- **Base de données**: MySQL 8.0
- **APIs externes**: Amadeus (vols), Booking.com (hôtels), Stripe (paiements)
- **Authentification**: JWT (JSON Web Tokens)

---

## Architecture Backend (Spring Boot)

### Structure des packages

```
com.voyageconnect/
├── config/              # Configuration (Security, CORS, etc.)
├── controller/          # API REST Controllers
│   ├── AmadeusController
│   ├── HotelController
│   ├── FlightController
│   ├── ReservationController
│   ├── PaymentController
│   └── AuthController
├── service/             # Logique métier
│   ├── AmadeusClientService
│   ├── AmadeusAuthService
│   ├── AmadeusHotelService
│   ├── BookingApiService
│   ├── ReservationService
│   └── PaymentService
├── repository/          # Accès données JPA
│   ├── UserRepository
│   ├── DestinationRepository
│   ├── HotelRepository
│   ├── FlightRepository
│   └── ReservationRepository
├── model/              # Entités JPA
│   ├── User
│   ├── Destination
│   ├── Hotel
│   ├── Flight
│   └── Reservation
├── dto/                # Data Transfer Objects
├── security/           # JWT & Security
│   ├── JwtAuthenticationFilter
│   ├── JwtTokenProvider
│   └── SecurityConfig
└── exception/          # Gestion des erreurs
```

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur

#### Destinations & Recherche
- `GET /api/amadeus/destinations?keyword={keyword}` - Recherche de destinations
- `GET /api/hotels?city={cityCode}` - Recherche d'hôtels
- `GET /api/flights/search` - Recherche de vols

#### Réservations
- `POST /api/reservations` - Créer une réservation
- `GET /api/reservations/user` - Réservations de l'utilisateur
- `GET /api/reservations/{id}` - Détail d'une réservation

#### Paiements
- `POST /api/payment/create-intent` - Créer une intention de paiement Stripe

---

## Architecture Frontend (Angular)

### Structure des modules

```
src/app/
├── auth/                      # Module d'authentification
│   ├── login/
│   └── register/
├── pages/                     # Pages principales
│   ├── home/                  # Page d'accueil
│   └── my-reservations/       # Mes réservations
├── user/                      # Modules utilisateur
│   ├── hotel-search/          # Recherche d'hôtels
│   └── flight-search/         # Recherche de vols
├── booking/                   # Processus de réservation
├── payment/                   # Processus de paiement
├── admin/                     # Administration
│   ├── admin-dashboard/
│   └── reservations-management/
├── services/                  # Services Angular
│   ├── auth.service.ts
│   ├── destination.service.ts
│   ├── hotel.service.ts
│   ├── flight.service.ts
│   ├── reservation.service.ts
│   ├── payment.service.ts
│   └── image.service.ts
├── models/                    # Interfaces TypeScript
│   └── reservation.model.ts
├── core/                      # Guards & Interceptors
│   ├── auth.guard.ts
│   ├── admin.guard.ts
│   ├── jwt.interceptor.ts
│   ├── loading.interceptor.ts
│   └── error.interceptor.ts
└── shared/                    # Composants partagés
    └── material.module.ts
```

### Composants principaux

#### Pages
- **Home**: Page d'accueil avec recherche de destinations
- **Hotel Search**: Recherche et sélection d'hôtels
- **Flight Search**: Recherche et sélection de vols
- **Booking**: Confirmation et finalisation de réservation
- **Payment**: Traitement du paiement via Stripe
- **My Reservations**: Liste des réservations utilisateur

#### Services
- **AuthService**: Gestion de l'authentification JWT
- **DestinationService**: Recherche de destinations via Amadeus
- **HotelService**: Recherche d'hôtels via Booking.com
- **FlightService**: Recherche de vols via Amadeus
- **ReservationService**: Gestion des réservations
- **PaymentService**: Intégration Stripe
- **ImageService**: Gestion des images Unsplash

---

## Base de données MySQL

### Schéma des tables principales

#### Users
```sql
users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

#### Destinations
```sql
destinations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  iata_code VARCHAR(3),
  description TEXT,
  image_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT FALSE
)
```

#### Hotels
```sql
hotels (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  destination_id BIGINT,
  price_per_night DECIMAL(10,2),
  available_rooms INT,
  FOREIGN KEY (destination_id) REFERENCES destinations(id)
)
```

#### Flights
```sql
flights (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  origin_id BIGINT,
  destination_id BIGINT,
  departure_date DATE,
  return_date DATE,
  price DECIMAL(10,2),
  available_seats INT,
  airline VARCHAR(100),
  FOREIGN KEY (origin_id) REFERENCES destinations(id),
  FOREIGN KEY (destination_id) REFERENCES destinations(id)
)
```

#### Reservations
```sql
reservations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type ENUM('FLIGHT', 'HOTEL', 'BOTH'),
  status ENUM('PENDING', 'CONFIRMED', 'CANCELLED'),
  total_price DECIMAL(10,2),
  flight_details JSON,
  hotel_details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

---

## APIs Externes

### 1. Amadeus API (Vols & Destinations)

**Configuration**:
```yaml
amadeus:
  api:
    key: ${AMADEUS_API_KEY}
    secret: ${AMADEUS_API_SECRET}
  test-mode: true
```

**Endpoints utilisés**:
- `/v1/security/oauth2/token` - Authentification OAuth2
- `/v1/reference-data/locations` - Recherche de destinations
- `/v2/shopping/flight-offers` - Recherche de vols
- `/v1/reference-data/locations/hotels/by-city` - Hôtels par ville (Maroc)

**Flux d'authentification**:
1. Génération du token OAuth2 avec client_id/client_secret
2. Cache du token (valide 30 minutes)
3. Rafraîchissement automatique avant expiration

### 2. Booking.com API (Hôtels)

**Configuration**:
```yaml
rapidapi:
  booking:
    key: ${RAPIDAPI_BOOKING_KEY}
    host: booking-com.p.rapidapi.com
    base-url: https://booking-com.p.rapidapi.com
```

**Endpoints utilisés**:
- `/v2/hotels/search` - Recherche d'hôtels par destination
- Paramètres: dest_id, dest_type, checkin_date, checkout_date, adults_number

**Stratégie de routage**:
- Villes marocaines → Amadeus API (meilleure couverture)
- Autres villes → Booking.com API

### 3. Stripe API (Paiements)

**Configuration**:
```yaml
stripe:
  secret-key: ${STRIPE_SECRET_KEY}
```

**Intégration**:
- Création de PaymentIntent côté backend
- Confirmation du paiement via Stripe.js frontend
- Webhook pour les notifications de paiement

### 4. Unsplash API (Images)

**Utilisation**:
- Images de destinations par défaut
- Images d'hôtels de secours
- Recherche par ville/pays pour cohérence

---

## Flux de données

### 1. Recherche de destinations
```
User Input → Frontend → Backend Controller
          → AmadeusClientService → Amadeus API
          → Response → Frontend → Display
```

### 2. Recherche d'hôtels
```
User selects city → Frontend → HotelController
                → Check if Moroccan city
                → YES: AmadeusHotelService
                → NO: BookingApiService
                → Parse & transform response
                → Return to frontend
                → Display hotel cards
```

### 3. Processus de réservation
```
User selects hotel/flight → Booking component
                         → Create reservation (PENDING)
                         → PaymentService.createIntent()
                         → Stripe PaymentIntent created
                         → Frontend Stripe.js confirmation
                         → Payment success
                         → Update reservation (CONFIRMED)
                         → Send confirmation email (future)
```

---

## Sécurité

### Authentification JWT

**Génération du token**:
```java
JWT.create()
   .withSubject(user.getEmail())
   .withExpiresAt(Date.from(Instant.now().plusMillis(expiration)))
   .withClaim("role", user.getRole())
   .sign(Algorithm.HMAC512(secret));
```

**Validation du token**:
```java
JwtAuthenticationFilter (extends OncePerRequestFilter)
  → Extract token from Authorization header
  → Validate token signature & expiration
  → Extract user email
  → Load user details
  → Set SecurityContext
```

**Protection des endpoints**:
```java
@PreAuthorize("hasRole('USER')")  // Utilisateurs authentifiés
@PreAuthorize("hasRole('ADMIN')") // Administrateurs uniquement
```

### CORS Configuration
```java
@CrossOrigin(origins = "http://localhost:4200")
```

### Variables d'environnement (.env)
```properties
# Jamais committées dans Git
AMADEUS_API_KEY=***
AMADEUS_API_SECRET=***
RAPIDAPI_BOOKING_KEY=***
STRIPE_SECRET_KEY=***
JWT_SECRET=***
DB_PASSWORD=***
```

---

## Configuration & Déploiement

### Backend (Spring Boot)

**application.yml**:
```yaml
server:
  port: 8080

spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

amadeus:
  api:
    key: ${AMADEUS_API_KEY}
    secret: ${AMADEUS_API_SECRET}

rapidapi:
  booking:
    key: ${RAPIDAPI_BOOKING_KEY}
    host: booking-com.p.rapidapi.com
    base-url: https://booking-com.p.rapidapi.com

stripe:
  secret-key: ${STRIPE_SECRET_KEY}

jwt:
  secret: ${JWT_SECRET}
  expiration-ms: 86400000
```

**Build & Run**:
```bash
# Build
mvn clean package -DskipTests

# Run
java -jar target/voyageconnect-backend-0.0.1-SNAPSHOT.jar
```

### Frontend (Angular)

**proxy.conf.json**:
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

**Build & Run**:
```bash
# Development
npm start
# Runs on http://localhost:4200

# Production build
ng build --configuration production
```

### Base de données

**Initialisation**:
```bash
# Créer la base de données
mysql -u root -p
CREATE DATABASE voyage_db;

# Import des données initiales
mysql -u root -p voyage_db < backend/src/main/resources/data.sql
```

---

## Flux complet de l'application

### Scénario: Réserver un hôtel à Paris

1. **Recherche de destination**
   - Utilisateur tape "par" dans la barre de recherche
   - Frontend appelle `/api/amadeus/destinations?keyword=par`
   - Backend interroge Amadeus API
   - Retourne liste de destinations (Paris, Parkersburg, etc.)

2. **Sélection et recherche d'hôtels**
   - Utilisateur sélectionne "Paris (PAR)"
   - Frontend appelle `/api/hotels?city=PAR`
   - Backend route vers Booking.com (Paris non-marocain)
   - BookingApiService convertit PAR → PARIS
   - Appelle Booking.com v2 API avec dest_id=-1456928
   - Parse la réponse et transforme en format standard
   - Retourne liste d'hôtels avec images

3. **Sélection d'hôtel**
   - Utilisateur clique sur un hôtel
   - Redirigé vers page de réservation
   - Remplit dates et nombre de personnes

4. **Création de réservation**
   - Frontend appelle `/api/reservations` avec détails
   - Backend crée réservation avec status=PENDING
   - Retourne reservation_id

5. **Paiement**
   - Frontend appelle `/api/payment/create-intent`
   - Backend crée Stripe PaymentIntent
   - Retourne client_secret
   - Frontend affiche formulaire Stripe
   - Utilisateur confirme paiement
   - Stripe valide le paiement

6. **Confirmation**
   - Backend reçoit confirmation de Stripe
   - Met à jour réservation: status=CONFIRMED
   - Frontend affiche confirmation
   - Utilisateur peut voir sa réservation dans "Mes réservations"

---

## Points d'amélioration futurs

### Performance
- [ ] Mise en cache Redis pour les résultats de recherche
- [ ] Pagination côté backend pour les grandes listes
- [ ] Lazy loading des images
- [ ] Service Worker pour mode offline

### Fonctionnalités
- [ ] Système de notifications par email (SendGrid/MailGun)
- [ ] Système de notation et avis
- [ ] Gestion des favoris
- [ ] Historique de navigation
- [ ] Recommandations personnalisées
- [ ] Support multi-devises
- [ ] Support multi-langues (i18n)

### Sécurité
- [ ] Refresh tokens pour JWT
- [ ] Rate limiting sur les APIs
- [ ] Captcha sur l'inscription
- [ ] 2FA (Two-Factor Authentication)
- [ ] Audit logs pour les actions admin

### DevOps
- [ ] CI/CD avec GitHub Actions
- [ ] Conteneurisation Docker
- [ ] Orchestration Kubernetes
- [ ] Monitoring avec Prometheus/Grafana
- [ ] Logs centralisés (ELK Stack)

---

## Contacts & Ressources

### Documentation des APIs
- [Amadeus API Docs](https://developers.amadeus.com/)
- [Booking.com RapidAPI](https://rapidapi.com/apidojo/api/booking-com)
- [Stripe API Docs](https://stripe.com/docs/api)
- [Unsplash API](https://unsplash.com/developers)

### Technologies
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

**Version**: 1.0  
**Dernière mise à jour**: 14 janvier 2026  
**Auteur**: VoyageConnect Team
