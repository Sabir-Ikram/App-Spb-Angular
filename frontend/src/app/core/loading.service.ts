import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  show() {
    this.count++;
    if (this.count > 0) this.loadingSubject.next(true);
  }

  hide() {
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0) this.loadingSubject.next(false);
  }
}
