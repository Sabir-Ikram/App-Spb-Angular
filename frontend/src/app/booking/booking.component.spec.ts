import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingComponent } from './booking.component';
import { ReservationService } from '../services/reservation.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('BookingComponent', () => {
  let comp: BookingComponent;
  let fixture: ComponentFixture<BookingComponent>;
  let mockRes: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockRes = { create: jest.fn() };
    mockRouter = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      declarations: [BookingComponent],
      providers: [
        { provide: ReservationService, useValue: mockRes },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingComponent);
    comp = fixture.componentInstance;
  });

  it('creates reservation and navigates on success', () => {
    comp.flightId = 1;
    comp.hotelId = 2;
    mockRes.create.mockReturnValue(of({ id: 7 }));
    comp.onBook();
    expect(mockRes.create).toHaveBeenCalled();
  });

  it('alerts on failure', () => {
    spyOn(window, 'alert');
    mockRes.create.mockReturnValue(throwError(() => new Error('fail')));
    comp.onBook();
    expect(window.alert).toHaveBeenCalledWith('Booking failed');
  });
});
