#!/bin/bash
# Start VoyageConnect Backend with Amadeus API Configuration
# Make sure to set AMADEUS_API_KEY and AMADEUS_API_SECRET before running

if [ -z "$AMADEUS_API_KEY" ]; then
    echo ""
    echo "ERROR: AMADEUS_API_KEY environment variable not set!"
    echo ""
    echo "Please set your Amadeus API credentials:"
    echo "  export AMADEUS_API_KEY=\"your_api_key\""
    echo "  export AMADEUS_API_SECRET=\"your_api_secret\""
    echo ""
    exit 1
fi

echo ""
echo "Starting VoyageConnect Backend..."
echo "API Key configured: $AMADEUS_API_KEY"
echo ""

cd backend
./mvnw spring-boot:run
