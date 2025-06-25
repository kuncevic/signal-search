import { Component, OnInit, OnDestroy } from '@angular/core';
import { User, API_URL } from './types';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BehaviorSubject, Subject, Observable, of } from 'rxjs';
import {
  switchMap,
  tap,
  catchError,
  finalize,
  takeUntil,
} from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [MatProgressBarModule, CommonModule],
  template: `
    <fieldset>
      <legend>RxJS-powered Search</legend>
      <input
        (input)="querySubject.next($any($event.target).value)"
        type="search"
        placeholder="Search..."
      />
    </fieldset>
    @if (isLoading$ | async) {
      <mat-progress-bar mode="query"></mat-progress-bar>
    }
    @if (error$ | async; as error) {
      <div class="error">{{ error }}</div>
    }
    <section class="actions">
      <button (click)="reload()">Reload</button>
      <button (click)="clear()">Clear</button>
    </section>
    <ul>
      @if (users$ | async; as users) {
        @for (user of users; track user.id) {
          <li>{{ user.name }}</li>
        } @empty {
          <li class="no-data">No Data</li>
        }
      }
    </ul>
  `,
})
export class SearchComponent implements OnDestroy {
  public querySubject = new BehaviorSubject<string>('');
  private destroy$ = new Subject<void>();

  users$: Observable<User[]>;
  isLoading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    this.users$ = this.querySubject.pipe(
      tap(() => {
        this.isLoading$.next(true);
        this.error$.next(null);
      }),
      switchMap((query) =>
        this.http.get<User[]>(`${API_URL}?name_like=^${query}`).pipe(
          catchError((error) => {
            this.error$.next('Could not fetch users');
            return of([]);
          }),
          finalize(() => this.isLoading$.next(false))
        )
      ),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reload() {
    this.querySubject.next(this.querySubject.getValue());
  }

  clear() {
    this.users$ = of([]);
    this.querySubject.next('');
    this.error$.next(null);
  }

  trackById(index: number, user: User): number {
    return user.id;
  }
}
