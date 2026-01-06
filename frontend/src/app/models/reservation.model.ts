export enum ReservationType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  BOTH = 'BOTH'
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface FlightReservationData {
  externalFlightId: string;
  origin: string;
  destination: string;
  destinationCity?: string; // Full city name for the destination
  departureDate: string;
  returnDate?: string;
  airline: string;
  price: number;
  passengers: number;
  itinerary: string;
}

export interface HotelReservationData {
  externalHotelId: string;
  hotelName: string;
  city: string;
  address: string;
  checkIn: string;
  checkOut: string;
  roomCount: number;
  pricePerNight: number;
  totalPrice: number;
  nights: number;
  rating?: number;
  imageUrl?: string;
}

export interface CreateReservationRequest {
  type: ReservationType;
  flight?: FlightReservationData;
  hotel?: HotelReservationData;
}

export interface FlightDetails {
  externalFlightId: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  airline: string;
  price: number;
  passengers: number;
  itinerary: string;
}

export interface HotelDetails {
  externalHotelId: string;
  hotelName: string;
  city: string;
  address: string;
  checkInDate: string;
  checkOutDate: string;
  roomCount: number;
  pricePerNight: number;
  totalPrice: number;
  nights: number;
  rating?: number;
  imageUrl?: string;
}

export interface ReservationResponse {
  id: number;
  userId: number;
  userEmail: string;
  type: ReservationType;
  status: ReservationStatus;
  totalPrice: number;
  createdAt: string;
  flightDetails?: FlightDetails;
  hotelDetails?: HotelDetails;
}
