import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-search-results',
  template: `
    <mat-list *ngIf="results?.length; else empty">
      <mat-list-item *ngFor="let r of results">
        <mat-card style="width:100%">
          <mat-card-title>{{ r.destination?.city }} - {{ r.id }}</mat-card-title>
          <mat-card-content>
            <div>Departure: {{ r.departure | date:'short' }}</div>
            <div>Price: {{ r.price }}</div>
            <button mat-raised-button color="accent">Book</button>
          </mat-card-content>
        </mat-card>
      </mat-list-item>
    </mat-list>
    <ng-template #empty><p>No results</p></ng-template>
  `
})
export class SearchResultsComponent {
  @Input() results: any[] = [];
}
