# Amadeus API Integration - Setup Guide

## Overview
This application has been updated to use **REAL DATA** from the Amadeus API instead of mock data.

## Prerequisites
1. **Amadeus Developer Account**: https://developers.amadeus.com/
2. **Test API Credentials** (you must get these from Amadeus)
3. Backend running on port 8080
4. Frontend running on port 4202

## Environment Variables Setup

### Windows PowerShell
```powershell
# Set environment variables for current session
$env:AMADEUS_API_KEY = "your_actual_api_key"
$env:AMADEUS_API_SECRET = "your_actual_api_secret"
$env:AMADEUS_TEST_MODE = "true"

# Verify
Write-Host $env:AMADEUS_API_KEY
```

### Windows Command Prompt
```cmd
setx AMADEUS_API_KEY "your_actual_api_key"
setx AMADEUS_API_SECRET "your_actual_api_secret"
setx AMADEUS_TEST_MODE "true"
```

### Linux/Mac
```bash
export AMADEUS_API_KEY="your_actual_api_key"
export AMADEUS_API_SECRET="your_actual_api_secret"
export AMADEUS_TEST_MODE="true"
```

## Getting Amadeus API Credentials

1. Visit https://developers.amadeus.com/
2. Sign up for a free account
3. Create a new app in your dashboard
4. You'll receive:
   - **API Key** (Client ID)
   - **API Secret** (Client Secret)
5. Ensure the app is in **TEST MODE** for development

## Backend Services

### New Services Created:

#### 1. **AmadeusAuthService**
- Location: `backend/src/main/java/com/voyageconnect/service/AmadeusAuthService.java`
- Responsibilities:
  - OAuth2 token generation
  - Token caching with expiration handling
  - Automatic token refresh before expiry
  - Synchronized token generation to prevent race conditions

#### 2. **AmadeusClientService**
- Location: `backend/src/main/java/com/voyageconnect/service/AmadeusClientService.java`
- Methods:
  - `searchDestinations(keyword)` - Search cities/airports by keyword
  - `searchFlights(origin, destination, departureDate)` - Search available flights
  - `searchHotels(cityCode, checkIn, checkOut)` - Search available hotels
- Handles:
  - OAuth2 authentication
  - API response parsing
  - Error handling and logging

### Updated Services:

#### 1. **FlightController**
- Now calls `AmadeusClientService.searchFlights()`
- Returns real Amadeus flight data
- Endpoint: `GET /api/flights?origin=CDG&destination=LAX&departureDate=2026-02-15`

#### 2. **HotelController**
- Now calls `AmadeusClientService.searchHotels()`
- Returns real Amadeus hotel data
- Endpoint: `GET /api/hotels?city=Paris&checkIn=2026-02-15&checkOut=2026-02-20`

### New REST Endpoints:

```
GET /api/amadeus/destinations?keyword=Paris
  Returns: List of destinations with IATA codes

GET /api/amadeus/flights?origin=CDG&destination=LAX&departureDate=2026-02-15
  Returns: List of available flights with real pricing

GET /api/amadeus/hotels?cityCode=PAR&checkIn=2026-02-15&checkOut=2026-02-20
  Returns: List of available hotels with real pricing
```

## Frontend Services

### Updated Services:

1. **DestinationService** - Search destinations from Amadeus API
2. **FlightService** - Search flights (calls backend which calls Amadeus)
3. **HotelService** - Search hotels (calls backend which calls Amadeus)
4. **ReservationService** - Create/manage reservations (saves locally)

## Data Flow

```
Angular Frontend
  ↓
Backend REST API (/api/flights, /api/hotels, etc.)
  ↓
AmadeusClientService
  ↓
AmadeusAuthService (gets OAuth2 token)
  ↓
Amadeus API (test.api.amadeus.com)
  ↓
Real flight/hotel/destination data
  ↓
Parsed & formatted response
  ↓
Backend stores reservation in MySQL
  ↓
Angular displays results
```

## Amadeus API Endpoints Used

### Flights
- **Endpoint**: `https://test.api.amadeus.com/v2/shopping/flight-offers`
- **Method**: GET
- **Params**: 
  - `originLocationCode` (IATA code, e.g., "CDG")
  - `destinationLocationCode` (IATA code, e.g., "LAX")
  - `departureDate` (ISO date, e.g., "2026-02-15")
  - `adults=1`
  - `max=10` (max results)

### Hotels
- **Endpoint**: `https://test.api.amadeus.com/v2/shopping/hotel-offers`
- **Method**: GET
- **Params**:
  - `cityCode` (IATA city code, e.g., "PAR")
  - `checkInDate` (ISO date, e.g., "2026-02-15")
  - `checkOutDate` (ISO date, e.g., "2026-02-20")
  - `adults=1`
  - `max=10` (max results)

### Locations
- **Endpoint**: `https://test.api.amadeus.com/v1/reference-data/locations`
- **Method**: GET
- **Params**:
  - `keyword` (search term, e.g., "Paris")
  - `subType=CITY`

## Testing the Integration

### 1. Start Backend with Environment Variables
```powershell
$env:AMADEUS_API_KEY = "your_key"
$env:AMADEUS_API_SECRET = "your_secret"
cd backend
.\mvnw.ps1 spring-boot:run
```

### 2. Start Frontend
```bash
cd frontend
ng serve
```

### 3. Test API Endpoints
```bash
# Search flights
curl "http://localhost:8080/api/flights?origin=CDG&destination=LAX&departureDate=2026-02-15"

# Search hotels
curl "http://localhost:8080/api/hotels?cityCode=PAR&checkIn=2026-02-15&checkOut=2026-02-20"

# Search destinations
curl "http://localhost:8080/api/amadeus/destinations?keyword=Paris"
```

### 4. Test in Browser
1. Open http://localhost:4202
2. Click "Search Flights"
3. Enter origin (e.g., "CDG"), destination (e.g., "LAX"), departure date
4. View real Amadeus flight results
5. Select a flight and proceed to booking

## Security Features

✅ **API Keys Protected**
- Never hardcoded in code
- Loaded from environment variables
- Not logged or exposed

✅ **OAuth2 Token Management**
- Tokens cached to reduce API calls
- Automatic refresh before expiration
- Thread-safe token generation

✅ **CORS Enabled**
- Cross-origin requests allowed for Angular frontend
- Proper headers set on all endpoints

✅ **JWT Authentication**
- Reservation creation requires user authentication
- JWT tokens validated on protected endpoints

## Common Issues & Solutions

### Issue: "Authentication with Amadeus API failed"
**Solution**: 
- Verify environment variables are set correctly
- Check API key/secret from Amadeus dashboard
- Ensure Amadeus app is in TEST mode

### Issue: "No flights found"
**Solution**:
- Use valid IATA codes (CDG, LAX, PAR, etc.)
- Use future dates (after 2026-01-04)
- Check Amadeus API documentation for valid routes

### Issue: "CORS error in Angular"
**Solution**:
- @CrossOrigin annotations added to all controllers
- Should be handled automatically

## Production Deployment

When deploying to production:

1. **Update Amadeus API URL**
   - Change from `test.api.amadeus.com` to `api.amadeus.com`
   - In `AmadeusClientService.java`

2. **Environment Variables**
   - Store securely in:
     - AWS Secrets Manager
     - Azure Key Vault
     - Environment config in deployment platform
   - NEVER commit to git

3. **Rate Limiting**
   - Implement caching for frequently searched routes
   - Add circuit breaker pattern for API calls

4. **Error Handling**
   - Log all Amadeus API errors
   - Implement fallback mechanisms
   - Monitor token refresh rate

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Frontend                          │
│                   (Port 4202)                                │
│  SearchComponent → FlightService → HTTP Request              │
└──────────────────────────────────┬──────────────────────────┘
                                   │
                    REST API Call: /api/flights
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Spring Boot Backend                             │
│                 (Port 8080)                                  │
│  FlightController                                            │
│      ↓                                                       │
│  AmadeusClientService                                        │
│      ├─ searchFlights()                                      │
│      ├─ searchHotels()                                       │
│      ├─ searchDestinations()                                 │
│      ↓                                                       │
│  AmadeusAuthService                                          │
│      ├─ getAccessToken() (with caching)                      │
│      ├─ generateNewToken()                                   │
│      └─ tokenExpiryHandling                                  │
└──────────────────────────────────┬──────────────────────────┘
                                   │
               OAuth2 Token + API Request
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│           Amadeus API (test.api.amadeus.com)                │
│                                                             │
│  /v2/shopping/flight-offers                                │
│  /v2/shopping/hotel-offers                                 │
│  /v1/reference-data/locations                              │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
backend/
├── src/main/java/com/voyageconnect/
│   ├── service/
│   │   ├── AmadeusAuthService.java         (NEW)
│   │   ├── AmadeusClientService.java       (NEW)
│   │   ├── AmadeusFlightService.java       (OLD - deprecated)
│   │   ├── AmadeusHotelService.java        (OLD - deprecated)
│   │   └── ReservationService.java
│   ├── controller/
│   │   ├── AmadeusController.java          (NEW)
│   │   ├── FlightController.java           (UPDATED)
│   │   ├── HotelController.java            (UPDATED)
│   │   └── ReservationController.java
│   ├── config/
│   │   ├── RestClientConfig.java           (NEW)
│   │   └── SecurityConfig.java
│   └── ...
├── resources/
│   └── application.yml                     (UPDATED)
└── ...

frontend/
├── src/app/
│   ├── services/
│   │   ├── destination.service.ts          (UPDATED)
│   │   ├── flight.service.ts               (USES NEW API)
│   │   ├── hotel.service.ts                (USES NEW API)
│   │   └── reservation.service.ts
│   ├── user/
│   │   ├── search/
│   │   │   └── search.component.ts
│   │   └── hotel-search/
│   │       └── hotel-search.component.ts
│   └── ...
└── ...
```

## Next Steps

1. Get Amadeus API credentials
2. Set environment variables
3. Start backend and frontend
4. Test with real Amadeus data
5. Customize search parameters as needed
6. Deploy to production with proper secret management

## Support & Resources

- **Amadeus API Docs**: https://developers.amadeus.com/docs/
- **API Explorer**: https://developers.amadeus.com/api/explorer
- **OAuth2 Guide**: https://developers.amadeus.com/blog/oauth2
