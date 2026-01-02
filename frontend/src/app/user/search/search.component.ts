import { Component, OnInit } from '@angular/core';
import { DestinationService } from '../../services/destination.service';
import { FlightService } from '../../services/flight.service';

@Component({
  selector: 'app-search',
  template: `
    <mat-card>
      <mat-toolbar>Search Travels</mat-toolbar>
      <div class="search-form">
        <mat-form-field appearance="fill"><mat-label>Destination</mat-label>
          <mat-select [(value)]="selectedDestination">
            <mat-option *ngFor="let d of destinations" [value]="d.id">{{d.city}}, {{d.country}}</mat-option>
          </mat-select>
        </mat-form-field>
        <button mat-raised-button color="primary" (click)="onSearch()">Search</button>
      </div>
    </mat-card>
    <app-search-results [results]="results"></app-search-results>
  `,
  styles: ['.search-form{display:flex;gap:12px;align-items:center;margin-top:12px;}']
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
