import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ReservationService } from '../../services/reservation.service';
import { ReservationResponse, ReservationStatus, ReservationType } from '../../models/reservation.model';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    RouterModule
  ],
  templateUrl: './my-reservations.component.html',
  styleUrls: ['./my-reservations.component.scss']
})
export class MyReservationsComponent implements OnInit {
  reservations: ReservationResponse[] = [];
  filteredReservations: ReservationResponse[] = [];
  loading = true;
  
  selectedStatus: string | null = null;
  selectedType: string | null = null;
  sortBy: string = 'date-desc';

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getUserReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.filteredReservations = data;
        this.sortReservations();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.loading = false;
      }
    });
  }

  filterByStatus(status: string | null): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  filterByType(type: string | null): void {
    this.selectedType = type;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.reservations];

    if (this.selectedStatus) {
      filtered = filtered.filter(r => r.status === this.selectedStatus);
    }

    if (this.selectedType) {
      filtered = filtered.filter(r => r.type === this.selectedType);
    }

    this.filteredReservations = filtered;
    this.sortReservations();
  }

  sortReservations(): void {
    switch (this.sortBy) {
      case 'date-desc':
        this.filteredReservations.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'date-asc':
        this.filteredReservations.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'price-desc':
        this.filteredReservations.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case 'price-asc':
        this.filteredReservations.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
    }
  }

  getReservationsByStatus(status: string): ReservationResponse[] {
    return this.reservations.filter(r => r.status === status);
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'FLIGHT':
        return 'flight';
      case 'HOTEL':
        return 'hotel';
      case 'PACKAGE':
        return 'card_travel';
      default:
        return 'event';
    }
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/hotel-placeholder.jpg';
  }

  viewDetails(reservation: ReservationResponse): void {
    // Navigate to reservation details or show dialog
    console.log('View details for reservation:', reservation.id);
  }
}
