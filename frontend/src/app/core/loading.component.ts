import { Component } from '@angular/core';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading',
  template: `
    <mat-progress-bar *ngIf="loading$ | async" mode="indeterminate"></mat-progress-bar>
  `
})
export class LoadingComponent {
  loading$ = this.loading.loading$;
  constructor(private loading: LoadingService) {}
}
