import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Hotel {
  id: number;
  name: string;
  pricePerNight: number;
  availableRooms: number;
  destinationId: number;
  address: string;
  rating: number;
  imageUrl: string;
  description: string;
  source?: string;  // 'BOOKING' or 'AMADEUS'
}

// Booking.com API raw response interface
interface BookingProperty {
  // v2 API fields
  id?: number;
  name?: string;
  photoMainUrl?: string;
  photoUrls?: string[];
  checkin?: any;
  checkout?: any;
  priceBreakdown?: any;
  reviewScore?: number;
  
  // v1 API fields (backward compatibility)
  hotel_id?: number;
  hotel_name?: string;
  hotel_name_trans?: string;
  min_total_price?: number;
  price_breakdown?: { gross_price?: number };
  address?: string;
  address_trans?: string;
  city?: string;
  review_score?: number;
  class?: number;
  main_photo_url?: string;
  max_photo_url?: string;
  url?: string;
}

interface BookingResponse {
  results?: BookingProperty[];  // v2 API
  result?: BookingProperty[];   // v1 API
  search_results?: BookingProperty[];
}

@Injectable({ providedIn: 'root' })
export class HotelService {
  private base = '/api/hotels';

  constructor(private http: HttpClient) {}

  list(city?: string, limit: number = 20): Observable<Hotel[]> {
    let params = new HttpParams();
    if (city) params = params.set('city', city);
    
    return this.http.get<any>(this.base, { params, responseType: 'json' }).pipe(
      map((response: any) => {
        // Handle raw Booking.com JSON response
        if (typeof response === 'string') {
          try {
            response = JSON.parse(response);
          } catch (e) {
            console.error('Failed to parse hotel response', e);
            return [];
          }
        }
        
        // If already an array (empty response)
        if (Array.isArray(response) && response.length === 0) {
          return [];
        }
        
        // Extract hotels from Booking API response
        let properties: BookingProperty[] = [];
        if (response.results) {
          // v2 API uses 'results' (with 's')
          properties = response.results;
        } else if (response.result) {
          // v1 API used 'result' (without 's')
          properties = response.result;
        } else if (response.search_results) {
          properties = response.search_results;
        } else if (Array.isArray(response)) {
          properties = response;
        }
        
        // Map to our Hotel interface (limit to requested number)
        return properties.slice(0, limit).map((prop, index) => this.mapBookingToHotel(prop, index));
      }),
      catchError(error => {
        console.error('Error fetching hotels:', error);
        return of([]);
      })
    );
  }

  private mapBookingToHotel(prop: BookingProperty, index: number): Hotel {
    // Support both v2 and v1 API structures
    const hotelId = prop.id || prop.hotel_id || (1000 + index);
    const hotelName = prop.name || prop.hotel_name_trans || prop.hotel_name || 'Hotel';
    
    const price = prop.min_total_price || 
                  (prop.price_breakdown?.gross_price) || 
                  (prop.priceBreakdown?.grossPrice?.value) ||
                  150;
    
    const rating = prop.reviewScore ? Math.min(Math.round(prop.reviewScore / 2), 5) :
                   (prop.review_score ? Math.min(Math.round(prop.review_score / 2), 5) : 
                   (prop.class || 4));
    
    // Get the best quality image URL from Booking.com (v2 or v1 API)
    let imageUrl = prop.photoMainUrl || prop.max_photo_url || prop.main_photo_url || 
                   (prop.photoUrls && prop.photoUrls.length > 0 ? prop.photoUrls[0] : null) ||
                   'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
    
    // Upgrade Booking.com image URLs to maximum quality
    imageUrl = this.upgradeBookingImageQuality(imageUrl);
    
    return {
      id: hotelId,
      name: hotelName,
      pricePerNight: Math.round(price),
      availableRooms: 10,
      destinationId: 1,
      address: prop.address_trans || prop.address || (prop.city || 'City Center'),
      rating: rating,
      imageUrl: imageUrl,
      description: `${rating}-star hotel in ${prop.city || 'the city'}`,
      source: 'BOOKING'
    };
  }

  /**
   * Upgrade Booking.com image URLs to maximum quality
   * Booking.com uses different size parameters in their URLs
   */
  private upgradeBookingImageQuality(url: string): string {
    if (!url || !url.includes('booking.com')) {
      return url;
    }

    try {
      const urlObj = new URL(url);
      
      // Replace common Booking.com size parameters with MAXIMUM QUALITY (Full HD 1920x1080)
      // Typical patterns: square60, square200, max300, max500, etc.
      let path = urlObj.pathname;
      
      // Replace size indicators with max quality - Full HD resolution
      path = path.replace(/square\d+/gi, 'max1920x1080');
      path = path.replace(/max\d+/gi, 'max1920x1080');
      path = path.replace(/\d+x\d+/g, '1920x1080');
      
      urlObj.pathname = path;
      
      // Add quality parameters if supported
      urlObj.searchParams.set('quality', '100');
      
      return urlObj.toString();
    } catch (e) {
      // If URL parsing fails, return original
      return url;
    }
  }

  getById(id: number): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.base}/${id}`);
  }

  create(hotel: any): Observable<Hotel> {
    return this.http.post<Hotel>(this.base, hotel);
  }

  update(id: number, hotel: any): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.base}/${id}`, hotel);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
