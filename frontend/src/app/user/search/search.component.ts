import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { DestinationService } from '../../services/destination.service';
import { FlightService } from '../../services/flight.service';
import { SearchResultsComponent } from './search-results.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    SearchResultsComponent
  ],
  template: `
    <mat-card class="search-container">
      <mat-toolbar color="primary">Search Travels</mat-toolbar>
      <div class="search-form">
        <mat-form-field appearance="outline" class="destination-field">
          <mat-label>Destination</mat-label>
          <mat-select [(value)]="selectedDestination">
            <mat-option *ngFor="let d of destinations" [value]="d.id">{{d.city}}, {{d.country}}</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="onSearch()">Search</button>
      </div>
    </mat-card>
    <app-search-results [results]="results"></app-search-results>
  `,
  styles: [`
    .search-container {
      margin: 16px;
    }
    .search-form {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-top: 12px;
      padding: 16px;
    }
    .destination-field {
      flex: 1;
      min-width: 200px;
    }
  `]
})
export class SearchComponent implements OnInit {
  destinations: any[] = [];
  selectedDestination: number | null = null;
  results: any[] = [];

  constructor(private destSvc: DestinationService, private flightSvc: FlightService) {}

  ngOnInit(): void {
    this.destSvc.getAll().subscribe(d => (this.destinations = d));
  }

  onSearch() {
    this.flightSvc.list(this.selectedDestination ?? undefined).subscribe(r => (this.results = r));
  }
}
