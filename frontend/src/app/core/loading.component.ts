import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    <mat-progress-bar *ngIf="loading$ | async" mode="indeterminate"></mat-progress-bar>
  `
})
export class LoadingComponent {
  loading$ = this.loading.loading$;
  constructor(private loading: LoadingService) {}
}
