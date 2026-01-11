# Quick Test - Amadeus + Booking.com Integration

## Run These Commands

### Test 1: Casablanca (Should use AMADEUS)
```powershell
Invoke-RestMethod "http://localhost:8080/api/hotels?city=CMN" | ConvertTo-Json
```

**Expected**: 
- 20 hotels from Amadeus
- Hotels have `provider: "AMADEUS"`
- Real Moroccan hotel names

### Test 2: Paris (Should use BOOKING.COM)
```powershell
Invoke-RestMethod "http://localhost:8080/api/hotels?city=PAR" | ConvertTo-Json
```

**Expected**:
- 2000+ hotels from Booking.com
- European hotel names
- Same JSON format as Amadeus

### Test 3: Marrakech (Should use AMADEUS)
```powershell
Invoke-RestMethod "http://localhost:8080/api/hotels?city=RAK" | ConvertTo-Json
```

**Expected**:
- 20 hotels from Amadeus
- Marrakech hotels
- Provider marked as AMADEUS

## Actual Results ✓

### Casablanca (CMN)
```
✓ Hotels found: 20
- RELAX AIRPORT - EX ATLAS AIRPORT
- IBIS CASA NEARSHORE
- ART PALACE & SPA
Provider: AMADEUS
```

### Paris (PAR)
```
✓ Hotels found: 2779
- Élégance & confort à deux pas de la Madeleine
- Hôtel de la Terrasse
Provider: BOOKING_COM (implicit)
```

### Marrakech (RAK)
```
✓ Hotels found: 20
- GOLDEN TULIP FARAH MARRAKECH
- LE MERIDIEN N FIS
Provider: AMADEUS
```

## Backend Logs to Verify

Look for these log messages:
```
→ Routing to AMADEUS for Moroccan city: CMN
✓ Searching Amadeus hotels for: CASABLANCA (CMN)
✓ Amadeus responded: 200 OK - 15234 chars
✓ Transformed 20 Amadeus hotels to Booking.com format

→ Routing to BOOKING.COM for city: PAR
✓ Fetching hotels for city: Paris
```

## Status: ✅ ALL TESTS PASSED

Both APIs are working correctly and routing based on city location.
