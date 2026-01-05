import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, catchError, shareReplay, tap } from 'rxjs/operators';

/**
 * Unsplash Image Service
 * Provides dynamic, high-quality images from Unsplash API
 * Features: Caching, keyword-based search, graceful fallbacks
 */

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description?: string;
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

interface CachedImage {
  url: string;
  timestamp: number;
  altText: string;
}

@Injectable({ providedIn: 'root' })
export class ImageService {
  private readonly UNSPLASH_API = 'https://api.unsplash.com';
  private readonly ACCESS_KEY = 'cCxTkTJG6CN_rnd3Ji5BOgoYugtKQqVIwpG6QPPG7_8';
  private readonly CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
  private readonly FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'; // Generic travel image
  
  // In-memory cache
  private imageCache = new Map<string, CachedImage>();
  
  // Loading states
  private loadingStates = new Map<string, BehaviorSubject<boolean>>();

  constructor(private http: HttpClient) {
    this.loadCacheFromStorage();
  }

  /**
   * Get image URL for a destination/city
   * @param cityName City name (e.g., "Paris", "Casablanca")
   * @param type Type of image: 'skyline' | 'travel' | 'tourism' | 'landmark'
   * @param size Image size: 'thumb' | 'small' | 'regular' | 'full'
   */
  getDestinationImage(
    cityName: string, 
    type: 'skyline' | 'travel' | 'tourism' | 'landmark' = 'skyline',
    size: 'thumb' | 'small' | 'regular' | 'full' = 'regular'
  ): Observable<{ url: string; altText: string }> {
    // Enhanced keywords for better, more iconic images
    const cityKeywords: Record<string, string> = {
      'paris': 'eiffel tower paris france landmark',
      'london': 'big ben london tower bridge landmark',
      'new york': 'statue liberty new york manhattan skyline',
      'tokyo': 'tokyo tower mount fuji japan landmark',
      'dubai': 'burj khalifa dubai skyscraper landmark',
      'barcelona': 'sagrada familia barcelona spain landmark',
      'casablanca': 'hassan II mosque casablanca morocco',
      'marrakech': 'koutoubia mosque marrakech morocco medina',
      'rabat': 'hassan tower rabat morocco kasbah',
      'fes': 'fes morocco medina blue gate',
      'fez': 'fez morocco medina blue gate',
      'tangier': 'tangier morocco kasbah mediterranean',
      'agadir': 'agadir morocco beach atlantic coast',
      'rome': 'colosseum rome italy landmark',
      'amsterdam': 'amsterdam canal houses netherlands',
      'istanbul': 'hagia sophia istanbul turkey',
      'singapore': 'marina bay sands singapore skyline',
      'sydney': 'sydney opera house harbour bridge',
      'cairo': 'pyramids giza cairo egypt',
      'athens': 'acropolis parthenon athens greece',
      'prague': 'prague castle charles bridge czech',
      'vienna': 'vienna palace austria schonbrunn',
      'berlin': 'brandenburg gate berlin germany',
      'madrid': 'royal palace madrid spain plaza',
      'lisbon': 'belem tower lisbon portugal',
      'rio de janeiro': 'christ redeemer rio brazil',
      'los angeles': 'hollywood sign los angeles california',
      'san francisco': 'golden gate bridge san francisco',
      'chicago': 'chicago skyline millennium park',
      'mumbai': 'gateway india mumbai taj hotel',
      'bangkok': 'grand palace bangkok thailand temple',
      'beijing': 'forbidden city beijing china temple',
      'shanghai': 'oriental pearl tower shanghai bund',
      'hong kong': 'victoria harbour hong kong skyline',
      'seoul': 'seoul tower gyeongbokgung palace korea',
      'melbourne': 'melbourne flinders street federation square',
      'vancouver': 'vancouver harbor mountains canada',
      'toronto': 'cn tower toronto skyline canada',
      'mexico city': 'zocalo mexico city cathedral angel',
      'buenos aires': 'obelisco buenos aires argentina',
      'sao paulo': 'paulista avenue sao paulo brazil',
      'moscow': 'red square kremlin moscow russia',
      'st petersburg': 'hermitage winter palace st petersburg',
      'zurich': 'zurich lake swiss alps switzerland',
      'geneva': 'jet eau geneva lake switzerland',
      'oslo': 'oslo opera house norway fjord',
      'stockholm': 'gamla stan stockholm sweden palace',
      'copenhagen': 'little mermaid copenhagen denmark',
      'helsinki': 'helsinki cathedral senate square finland',
      'brussels': 'grand place brussels atomium belgium',
      'dublin': 'trinity college dublin ireland',
      'edinburgh': 'edinburgh castle scotland royal mile',
      'venice': 'rialto bridge venice gondola canal',
      'florence': 'duomo florence ponte vecchio italy',
      'milan': 'duomo milan italy galleria',
      'naples': 'vesuvius naples bay italy coast',
      'budapest': 'parliament budapest chain bridge hungary',
      'warsaw': 'old town warsaw palace poland',
      'krakow': 'market square krakow wawel castle',
      'bucharest': 'palace parliament bucharest romania',
      'sofia': 'alexander nevsky cathedral sofia bulgaria',
      'belgrade': 'kalemegdan fortress belgrade serbia',
      'zagreb': 'zagreb cathedral croatia old town'
    };

    // Get specific keyword or fallback to generic
    const cityLower = cityName.toLowerCase();
    const query = cityKeywords[cityLower] || `${cityName} famous landmark monument tourist`;
    
    return this.getImage(query, size, 'destination');
  }

  /**
   * Get image URL for a hotel
   * @param context Hotel context (e.g., "Morocco", "luxury", "boutique")
   * @param type Type of hotel image
   * @param size Image size
   */
  getHotelImage(
    context: string = '',
    type: 'exterior' | 'room' | 'lobby' | 'pool' = 'exterior',
    size: 'thumb' | 'small' | 'regular' | 'full' = 'regular'
  ): Observable<{ url: string; altText: string }> {
    const isMorocco = context.toLowerCase().includes('morocco') || 
                      context.toLowerCase().includes('marrakech') ||
                      context.toLowerCase().includes('casablanca') ||
                      context.toLowerCase().includes('rabat') ||
                      context.toLowerCase().includes('fes') ||
                      context.toLowerCase().includes('fez') ||
                      context.toLowerCase().includes('tangier') ||
                      context.toLowerCase().includes('agadir');
    
    // Enhanced hotel image keywords
    const typeQueries: Record<typeof type, string> = {
      exterior: isMorocco 
        ? 'riad morocco architecture beautiful courtyard fountain traditional'
        : 'luxury hotel resort architecture beautiful facade elegant',
      room: isMorocco
        ? 'riad morocco interior bedroom elegant traditional decor'
        : 'luxury hotel room elegant bed modern interior design',
      lobby: isMorocco
        ? 'riad morocco courtyard fountain mosaic tiles beautiful'
        : 'luxury hotel lobby elegant chandelier marble interior',
      pool: isMorocco
        ? 'riad morocco pool courtyard beautiful palm trees oasis'
        : 'infinity pool luxury resort beautiful ocean view sunset'
    };
    
    let query = typeQueries[type];
    
    // Add context if provided and not Morocco (Morocco already handled above)
    if (context && !isMorocco) {
      query = `${context} ${query}`;
    }
    
    return this.getImage(query, size, 'hotel');
  }

  /**
   * Get image for home page sections
   * @param section Section type
   * @param size Image size
   */
  getHomeImage(
    section: 'hero' | 'travel' | 'destinations' | 'flights' | 'hotels',
    size: 'thumb' | 'small' | 'regular' | 'full' = 'regular'
  ): Observable<{ url: string; altText: string }> {
    const queries: Record<typeof section, string> = {
      hero: 'airplane window view clouds sunset travel world',
      travel: 'travel adventure exotic destination wanderlust explore',
      destinations: 'world famous landmarks monuments cities architecture',
      flights: 'airplane flying clouds blue sky aviation',
      hotels: 'luxury boutique hotel resort elegant interior'
    };
    
    const imageType = section === 'hero' ? 'hero' : 'general';
    return this.getImage(queries[section], size, imageType);
  }

  /**
   * Get flight-related image
   * @param context Flight context (e.g., "departure", "arrival", "international")
   * @param size Image size
   */
  getFlightImage(
    context: 'departure' | 'arrival' | 'international' | 'domestic' = 'international',
    size: 'thumb' | 'small' | 'regular' | 'full' = 'regular'
  ): Observable<{ url: string; altText: string }> {
    const queries: Record<typeof context, string> = {
      departure: 'airplane takeoff departure airport runway',
      arrival: 'airplane landing arrival city lights',
      international: 'airplane flying clouds sunset international',
      domestic: 'airplane flight blue sky domestic travel'
    };
    return this.getImage(queries[context], size, 'general');
  }

  /**
   * Core method to get image by search query
   * Implements caching and fallback logic
   */
  private getImage(
    query: string, 
    size: 'thumb' | 'small' | 'regular' | 'full' = 'regular',
    imageType: 'destination' | 'hotel' | 'hero' | 'general' = 'general'
  ): Observable<{ url: string; altText: string }> {
    const cacheKey = `${query}_${size}`;
    
    // Check cache first
    const cached = this.getCachedImage(cacheKey);
    if (cached) {
      return of({ url: cached.url, altText: cached.altText });
    }

    // Check if already loading
    if (this.loadingStates.has(cacheKey)) {
      return this.loadingStates.get(cacheKey)!.pipe(
        map(() => {
          const cachedAfterLoad = this.getCachedImage(cacheKey);
          return cachedAfterLoad 
            ? { url: cachedAfterLoad.url, altText: cachedAfterLoad.altText }
            : { url: this.FALLBACK_IMAGE, altText: 'Travel destination' };
        })
      );
    }

    // Create loading state
    const loadingSubject = new BehaviorSubject<boolean>(true);
    this.loadingStates.set(cacheKey, loadingSubject);

    // Fetch from Unsplash API
    const params = new HttpParams()
      .set('query', query)
      .set('page', '1')
      .set('per_page', '1')
      .set('orientation', 'landscape')
      .set('client_id', this.ACCESS_KEY);

    return this.http.get<UnsplashSearchResponse>(`${this.UNSPLASH_API}/search/photos`, { params })
      .pipe(
        map(response => {
          if (response.results && response.results.length > 0) {
            const photo = response.results[0];
            const url = this.getOptimizedUrl(photo.urls[size], imageType);
            const altText = photo.alt_description || query;
            
            // Cache the result
            this.cacheImage(cacheKey, url, altText);
            
            return { url, altText };
          }
          
          // No results, use fallback
          return { url: this.FALLBACK_IMAGE, altText: 'Travel destination' };
        }),
        catchError(error => {
          console.warn(`Unsplash API error for "${query}":`, error.message);
          // Return fallback on error
          return of({ url: this.FALLBACK_IMAGE, altText: 'Travel destination' });
        }),
        tap(() => {
          loadingSubject.next(false);
          loadingSubject.complete();
          this.loadingStates.delete(cacheKey);
        }),
        shareReplay(1) // Share result among multiple subscribers
      );
  }

  /**
   * Optimize Unsplash URL with quality and size parameters
   */
  private getOptimizedUrl(url: string, imageType: 'destination' | 'hotel' | 'hero' | 'general' = 'general'): string {
    // Add Unsplash optimization parameters with higher quality
    const optimizedUrl = new URL(url);
    
    // Set quality and format
    optimizedUrl.searchParams.set('q', '90'); // Higher quality (was 80)
    optimizedUrl.searchParams.set('fm', 'jpg'); // Format
    optimizedUrl.searchParams.set('fit', 'crop'); // Fit
    
    // Set appropriate width based on image type
    const widths = {
      destination: '1200',  // Destination cards
      hotel: '1200',        // Hotel cards - higher resolution
      hero: '1920',         // Hero images
      general: '1000'       // General images
    };
    
    optimizedUrl.searchParams.set('w', widths[imageType]);
    
    // Add auto format for best quality/size ratio
    optimizedUrl.searchParams.set('auto', 'format');
    
    // Add sharpness for crisp images
    optimizedUrl.searchParams.set('sharp', '10');
    
    return optimizedUrl.toString();
  }

  /**
   * Get cached image if valid
   */
  private getCachedImage(key: string): CachedImage | null {
    const cached = this.imageCache.get(key);
    if (!cached) return null;
    
    // Check if cache is still valid
    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.imageCache.delete(key);
      this.saveCacheToStorage();
      return null;
    }
    
    return cached;
  }

  /**
   * Cache image URL
   */
  private cacheImage(key: string, url: string, altText: string): void {
    this.imageCache.set(key, {
      url,
      altText,
      timestamp: Date.now()
    });
    this.saveCacheToStorage();
  }

  /**
   * Load cache from localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem('unsplash_image_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.imageCache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn('Failed to load image cache:', error);
    }
  }

  /**
   * Save cache to localStorage
   */
  private saveCacheToStorage(): void {
    try {
      const cacheObj = Object.fromEntries(this.imageCache);
      localStorage.setItem('unsplash_image_cache', JSON.stringify(cacheObj));
    } catch (error) {
      console.warn('Failed to save image cache:', error);
    }
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.imageCache.clear();
    localStorage.removeItem('unsplash_image_cache');
  }

  /**
   * Preload images for better UX
   * @param queries Array of search queries to preload
   */
  preloadImages(queries: string[]): void {
    queries.forEach(query => {
      this.getImage(query, 'small').subscribe();
    });
  }

  /**
   * Check if image is loading
   */
  isLoading(query: string): Observable<boolean> {
    const cacheKey = `${query}_regular`;
    const loadingState = this.loadingStates.get(cacheKey);
    return loadingState ? loadingState.asObservable() : of(false);
  }
}
