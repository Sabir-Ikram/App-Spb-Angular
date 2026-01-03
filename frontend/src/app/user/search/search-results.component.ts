import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatButtonModule, RouterModule],
  template: `
    <div *ngIf="results && results.length > 0" class="results-container">
      <mat-card>
        <mat-card-title>Available Flights</mat-card-title>
        <mat-list>
          <mat-list-item *ngFor="let result of results">
            <div class="flight-info">
              <strong>{{ result.departure | date: 'short' }}</strong> - {{ result.price }} USD
            </div>
            <button mat-button routerLink="/booking" [queryParams]="{ flightId: result.id }">Book</button>
          </mat-list-item>
        </mat-list>
      </mat-card>
    </div>
    <div *ngIf="!results || results.length === 0" class="no-results">
      <p>No flights found</p>
    </div>
  `,
  styles: [`
    .results-container {
      margin-top: 20px;
    }
    .flight-info {
      flex: 1;
    }
    .no-results {
      text-align: center;
      margin-top: 20px;
      color: #999;
    }
  `]
})
export class SearchResultsComponent {
  @Input() results: any[] = [];
}
