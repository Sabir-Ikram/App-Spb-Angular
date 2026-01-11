import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { DestinationService } from '../../services/destination.service';
import { FlightService } from '../../services/flight.service';
import { of } from 'rxjs';

describe('SearchComponent', () => {
  let comp: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let mockDest: any;
  let mockFlight: any;

  beforeEach(async () => {
    mockDest = { getAll: jest.fn().mockReturnValue(of([{ id: 1, city: 'Paris', country: 'FR' }])) };
    mockFlight = { list: jest.fn().mockReturnValue(of([{ id: 5, departure: new Date(), price: 100 }])) };

    await TestBed.configureTestingModule({
      declarations: [SearchComponent],
      providers: [
        { provide: DestinationService, useValue: mockDest },
        { provide: FlightService, useValue: mockFlight }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    comp = fixture.componentInstance;
  });

  it('loads destinations on init', () => {
    comp.ngOnInit();
    expect(mockDest.getAll).toHaveBeenCalled();
    expect(comp.destinations.length).toBeGreaterThan(0);
  });

  it('searches flights by destination', () => {
    comp.selectedDestination = 1;
    comp.onSearch();
    expect(mockFlight.list).toHaveBeenCalledWith(1);
    expect(comp.results.length).toBeGreaterThan(0);
  });
});
