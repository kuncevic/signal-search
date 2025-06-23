import {Component, computed, resource, ResourceLoaderParams, signal} from '@angular/core';
import { User, API_URL } from './types';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-search',
  imports: [MatProgressBarModule],
  template: `
    <fieldset>
      <legend>Signal-powered Search</legend>
      <input (input)="query.set($any($event.target).value)" type="search" placeholder="Search...">
    </fieldset>
    @if (data.isLoading()) {
      <mat-progress-bar mode="query"/>
    }
    @if (data.error()) {
      <div class="error">{{ data.error() }}</div>
    }
    <section class="actions">
      <button (click)="data.reload()">Reload</button>
      <button (click)="data.set([])">Clear</button>
    </section>
    <ul>
      @for (user of data.value(); track user.id) {
        <li>{{ user.name }}</li>
      } @empty {
        <li class="no-data">No Data</li>
      }
    </ul>
  `
})
export class SearchComponent {
  query = signal('');

  data = resource<User[], { query: string }>({
    params: computed(() => ({ query: this.query() })),
    loader: async (options: ResourceLoaderParams<{ query: string }>): Promise<User[]> => {
      const { params: { query }, abortSignal } = options;
      const users = await fetch(`${API_URL}?name_like=^${query}`, {
        signal: abortSignal
      });
      if (!users.ok) throw new Error(`Could not fetch...`);
      return await users.json();
    }
  });
}