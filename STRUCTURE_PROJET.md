# Structure du Projet VoyageConnect

## Architecture Générale

```
projet-voyageconnect/
├── backend/           # API Spring Boot
├── frontend/          # Application Angular
└── documentation/     # Fichiers MD
```

## Backend (Spring Boot 3.1.2 - Java 21)

```
backend/
├── src/main/java/com/voyageconnect/
│   ├── controller/              # Points d'entrée API REST
│   │   ├── AuthController.java
│   │   ├── DestinationController.java
│   │   ├── FlightController.java
│   │   ├── HotelController.java
│   │   └── ReservationController.java
│   │
│   ├── service/                 # Logique métier
│   │   ├── BookingApiService.java      # Intégration Booking.com API v2
│   │   ├── AmadeusService.java         # Intégration Amadeus API
│   │   ├── DestinationService.java
│   │   └── ReservationService.java
│   │
│   ├── model/                   # Entités JPA
│   │   ├── User.java
│   │   ├── Destination.java
│   │   ├── Flight.java
│   │   ├── Hotel.java
│   │   └── Reservation.java
│   │
│   └── security/                # Configuration JWT
│       └── JwtTokenProvider.java
│
├── src/main/resources/
│   └── application.yml          # Configuration Spring
│
├── .env                         # Variables d'environnement (API keys)
├── pom.xml                      # Dépendances Maven
└── docker-compose.yml           # MySQL + Backend
```

## Frontend (Angular 16+)

```
frontend/
├── src/app/
│   ├── auth/                    # Authentification
│   │   ├── login/
│   │   └── register/
│   │
│   ├── user/                    # Interface utilisateur
│   │   ├── hotel-search/        # Recherche d'hôtels
│   │   └── flight-search/       # Recherche de vols
│   │
│   ├── pages/
│   │   ├── home/                # Page d'accueil
│   │   └── my-reservations/     # Gestion des réservations
│   │
│   ├── admin/                   # Interface admin
│   │   └── reservations-management/
│   │
│   ├── services/                # Services Angular
│   │   ├── hotel.service.ts     # API Hôtels
│   │   ├── flight.service.ts    # API Vols
│   │   ├── auth.service.ts      # Authentification
│   │   └── reservation.service.ts
│   │
│   ├── core/                    # Guards & Interceptors
│   │   ├── auth.guard.ts
│   │   ├── jwt.interceptor.ts
│   │   └── error.interceptor.ts
│   │
│   └── models/                  # Interfaces TypeScript
│       └── reservation.model.ts
│
├── angular.json                 # Configuration Angular
├── package.json                 # Dépendances npm
└── proxy.conf.json              # Configuration proxy API
```

## Base de Données (MySQL 8.0)

```sql
Tables principales:
├── users              # Utilisateurs (clients + admin)
├── destinations       # Destinations disponibles
├── flights            # Vols disponibles
├── hotels             # Hôtels (depuis API externes)
└── reservations       # Réservations effectuées
```

## APIs Externes Intégrées

- **Amadeus API v1** : Vols et destinations (villes marocaines)
- **Booking.com API v2** : Hôtels internationaux
- **Stripe API** : Paiements sécurisés
- **Unsplash API** : Images de secours

## Technologies Clés

### Backend
- **Framework** : Spring Boot 3.1.2
- **Langage** : Java 21
- **Build** : Maven
- **Base de données** : MySQL 8.0
- **Sécurité** : JWT (JSON Web Tokens)
- **Conteneurisation** : Docker

### Frontend
- **Framework** : Angular 16+
- **Langage** : TypeScript
- **UI** : Angular Material
- **State Management** : RxJS
- **Build** : Angular CLI

## Flux de Données Simplifié

```
Client (Angular)
    ↓ HTTP Request + JWT
Backend (Spring Boot)
    ↓ Validation JWT
Service Layer
    ↓ Appel API externe OU requête BDD
APIs Externes / MySQL
    ↓ Réponse
Backend transforme les données
    ↓ JSON Response
Client affiche les données
```
